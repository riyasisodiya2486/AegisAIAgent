"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVault = createVault;
exports.deposit = deposit;
exports.spend = spend;
exports.revokeAgent = revokeAgent;
exports.updateDailyLimit = updateDailyLimit;
exports.withdrawAll = withdrawAll;
exports.stakeIdleFunds = stakeIdleFunds;
exports.accrueYield = accrueYield;
exports.unstakeForSpend = unstakeForSpend;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const pda_1 = require("./pda");
const anchor = __importStar(require("@coral-xyz/anchor"));
function solToLamports(sol) {
    return new bn_js_1.default(Math.round(sol * web3_js_1.LAMPORTS_PER_SOL));
}
// ─── Vault lifecycle ─────────────────────────────────────────────────────────
/**
 * Creates a new Aegis vault PDA for the given agent.
 * @param dailyLimitSol - Maximum SOL the agent can spend per 24h window
 */
async function createVault(client, ownerPubkey, agentPubkey, dailyLimitSol) {
    const [vaultPda] = (0, pda_1.findVaultPda)(ownerPubkey, agentPubkey, client.programId);
    const sig = await client.program.methods
        .initializeVault(solToLamports(dailyLimitSol))
        .accounts({
        vault: vaultPda,
        owner: ownerPubkey,
        agentKey: agentPubkey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    return { signature: sig, vaultAddress: vaultPda };
}
/**
 * Deposits SOL from the owner's connected wallet into the vault.
 */
async function deposit(client, ownerPubkey, agentPubkey, amountSol) {
    const [vaultPda] = (0, pda_1.findVaultPda)(ownerPubkey, agentPubkey, client.programId);
    const sig = await client.program.methods
        .deposit(solToLamports(amountSol))
        .accounts({
        vault: vaultPda,
        owner: ownerPubkey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    return { signature: sig, vaultAddress: vaultPda };
}
/**
 * Agent spends from the vault. The agentKeypair must be available locally.
 * Used by the AI agent on Day 7 — not from the browser frontend.
 */
async function spend(client, vaultPda, agentKeypair, recipientPubkey, amountSol) {
    const amountLamports = solToLamports(amountSol);
    // Build the transaction manually to avoid the toString error
    const tx = await client.program.methods
        .spend(new anchor.BN(amountLamports.toString()))
        .accountsPartial({
        vault: vaultPda,
        agent: agentKeypair.publicKey,
        recipient: recipientPubkey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .transaction();
    // Set recent blockhash manually
    const { blockhash, lastValidBlockHeight } = await client.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = agentKeypair.publicKey;
    // Sign with agent keypair
    tx.sign(agentKeypair);
    // Send and confirm
    const rawTx = tx.serialize();
    const signature = await client.connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
    });
    if (!signature)
        throw new Error("No signature returned");
    await client.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
    return signature;
}
// ─── Owner controls ───────────────────────────────────────────────────────────
/**
 * Freezes the agent instantly. Only callable by the vault owner.
 */
async function revokeAgent(client, owner, agentKey // this is the ORIGINAL agent key
) {
    const programId = client.programId;
    const [vaultPda] = (0, pda_1.findVaultPda)(owner, agentKey, programId);
    const tx = await client.program.methods
        .revokeAgent()
        .accountsPartial({
        vault: vaultPda,
        owner: owner,
        originalAgentKey: agentKey,
    })
        .transaction();
    const { blockhash, lastValidBlockHeight } = await client.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = owner;
    // Use the provider's sendAndConfirm for a cleaner implementation if possible, 
    // but keeping your manual signing logic below:
    const signedTx = await client.program.provider.wallet.signTransaction(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
    return signature;
}
/**
 * Updates the daily spending limit. Only callable by the vault owner.
 */
async function updateDailyLimit(client, ownerPubkey, originalAgentKey, newLimitSol) {
    const [vaultPda] = (0, pda_1.findVaultPda)(ownerPubkey, originalAgentKey, client.programId);
    return client.program.methods
        .updateLimit(solToLamports(newLimitSol))
        .accounts({
        vault: vaultPda,
        owner: ownerPubkey,
    })
        .rpc();
}
/**
 * Closes the vault and returns all lamports to the owner.
 * NOTE: agentPubkey needed to re-derive the PDA seeds.
 * If the agent was revoked, pass PublicKey.default.
 */
async function withdrawAll(client, owner, originalAgentKey // must be original, not current (which is zero when frozen)
) {
    const programId = client.programId;
    const [vaultPda] = (0, pda_1.findVaultPda)(owner, originalAgentKey, programId);
    const tx = await client.program.methods
        .withdraw()
        .accounts({
        vault: vaultPda,
        owner: owner,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .transaction();
    const { blockhash, lastValidBlockHeight } = await client.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = owner;
    const signedTx = await client.program.provider.wallet.signTransaction(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
    return signature;
}
// ─── Yield management ────────────────────────────────────────────────────────
/**
 * Moves idle funds above the buffer into the yield-bearing staked bucket.
 */
async function stakeIdleFunds(client, ownerPubkey, originalAgentKey) {
    const [vaultPda] = (0, pda_1.findVaultPda)(ownerPubkey, originalAgentKey, client.programId);
    return client.program.methods
        .stakeIdleFunds()
        .accounts({
        vault: vaultPda,
        owner: ownerPubkey,
        config: client.configPda,
    })
        .rpc();
}
/**
 * Permissionless crank — updates the yield counter.
 * Call this on page load to show fresh yield numbers.
 */
async function accrueYield(client, vaultPda) {
    return client.program.methods
        .accrueYield()
        .accounts({
        vault: vaultPda,
    })
        .rpc();
}
/**
 * Agent-triggered unstake when liquid balance is insufficient for a spend.
 * Called automatically by the agent before spend if needed.
 */
async function unstakeForSpend(client, vaultPda, agentKeypair, amountNeededSol) {
    return client.program.methods
        .unstakeForSpend(solToLamports(amountNeededSol))
        .accounts({
        vault: vaultPda,
        agent: agentKeypair.publicKey,
    })
        .signers([agentKeypair])
        .rpc();
}
//# sourceMappingURL=instructions.js.map