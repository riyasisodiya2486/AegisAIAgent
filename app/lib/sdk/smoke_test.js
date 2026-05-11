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
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const client_1 = require("./client");
const instructions_1 = require("./instructions");
const accounts_1 = require("./accounts");
const pda_1 = require("./pda");
async function main() {
    const connection = new web3_js_1.Connection("http://127.0.0.1:8899", "confirmed");
    // Load the local deployer keypair from the Solana CLI default path
    const fs = await Promise.resolve().then(() => __importStar(require("fs")));
    const raw = JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf-8"));
    const owner = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(raw));
    // Generate a fresh agent keypair for this test
    const agentKeypath = process.env.HOME + "/aegis-agent-keypair.json";
    const agentRaw = JSON.parse(fs.readFileSync(agentKeypath, "utf-8"));
    const agent = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(agentRaw));
    console.log("\nOwner:", owner.publicKey.toBase58());
    console.log("Agent:", agent.publicKey.toBase58());
    const client = client_1.AegisClient.fromKeypair(owner, "http://127.0.0.1:8899");
    // --- Step 1: Create vault ---
    console.log("\n[1] Creating vault with 0.1 SOL daily limit...");
    const { vaultAddress } = await (0, instructions_1.createVault)(client, owner.publicKey, agent.publicKey, 0.1);
    console.log("    Vault PDA:", vaultAddress.toBase58());
    // --- Step 2: Deposit ---
    console.log("\n[2] Depositing 0.5 SOL...");
    const { signature: depSig } = await (0, instructions_1.deposit)(client, owner.publicKey, agent.publicKey, 0.5);
    console.log("    Tx:", depSig);
    // --- Step 3: Read vault state ---
    console.log("\n[3] Fetching vault state...");
    const state = await (0, accounts_1.getVaultState)(client, owner.publicKey, agent.publicKey);
    if (!state)
        throw new Error("Vault not found!");
    console.log("    Balance:      ", state.vaultBalanceSol.toFixed(4), "SOL");
    console.log("    Daily limit:  ", state.dailyLimitSol.toFixed(4), "SOL");
    console.log("    Spent today:  ", state.spentTodaySol.toFixed(4), "SOL");
    console.log("    Remaining:    ", state.remainingTodaySol.toFixed(4), "SOL");
    console.log("    Frozen:       ", state.isFrozen);
    // --- Step 4: Stake idle funds ---
    console.log("\n[4] Staking idle funds...");
    const stakeSig = await (0, instructions_1.stakeIdleFunds)(client, owner.publicKey, agent.publicKey);
    console.log("    Tx:", stakeSig);
    // --- Step 5: Accrue yield ---
    console.log("\n[5] Accruing yield...");
    const [vaultPda] = (0, pda_1.findVaultPda)(owner.publicKey, agent.publicKey, client.programId);
    const yieldSig = await (0, instructions_1.accrueYield)(client, vaultPda);
    console.log("    Tx:", yieldSig);
    // --- Step 6: Read final state ---
    const finalState = await (0, accounts_1.getVaultState)(client, owner.publicKey, agent.publicKey);
    if (!finalState)
        throw new Error("Vault disappeared!");
    console.log("\n[6] Final vault state:");
    console.log("    Liquid balance: ", finalState.vaultBalanceSol.toFixed(6), "SOL");
    console.log("    Staked:         ", finalState.stakedAmountSol.toFixed(6), "SOL");
    console.log("    Yield earned:   ", finalState.yieldEarnedSol.toFixed(9), "SOL");
    console.log("    Pending fee:    ", finalState.pendingFeeSol.toFixed(9), "SOL");
    console.log("    Yield rate:     ", finalState.yieldRatePercent.toFixed(2), "%");
    console.log("    Daily progress: ", finalState.dailySpendProgressPct, "%");
    console.log("\nSmoke test passed.");
}
main().catch((err) => {
    console.error("Smoke test failed:", err);
    process.exit(1);
});
//# sourceMappingURL=smoke_test.js.map