"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVaultState = getVaultState;
exports.getVaultStateByAddress = getVaultStateByAddress;
exports.getProtocolConfig = getProtocolConfig;
exports.subscribeToVault = subscribeToVault;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const pda_1 = require("./pda");
function lamportsToSol(lamports) {
    const n = typeof lamports === "number" ? lamports : lamports.toNumber();
    return n / web3_js_1.LAMPORTS_PER_SOL;
}
/**
 * Common formatting logic for raw vault data.
 * Handles the "Frozen Vault" logic by falling back to originalAgentKey.
 */
function formatVaultState(raw, vaultPda) {
    const vaultBalance = lamportsToSol(raw.vaultBalance);
    const dailyLimit = lamportsToSol(raw.dailyLimit);
    // FIX: The on-chain state only updates spent_today on the next spend transaction.
    // We must visually reset it in the UI if 24 hours have passed.
    const now = Math.floor(Date.now() / 1000);
    const lastResetTs = raw.lastResetTs.toNumber();
    const spentTodayLamports = (now - lastResetTs >= 86400) ? new bn_js_1.default(0) : raw.spentToday;
    const spentToday = lamportsToSol(spentTodayLamports);
    // KEY FIX: If agentKey is zero (frozen), use originalAgentKey for UI display
    const isFrozen = raw.agentKey.equals(web3_js_1.PublicKey.default);
    const displayAgentKey = isFrozen ? raw.originalAgentKey : raw.agentKey;
    return {
        raw,
        address: vaultPda,
        ownerAddress: raw.owner.toBase58(),
        agentAddress: displayAgentKey.toBase58(),
        isFrozen,
        vaultBalanceSol: vaultBalance,
        dailyLimitSol: dailyLimit,
        spentTodaySol: spentToday,
        remainingTodaySol: Math.max(0, dailyLimit - spentToday),
        stakedAmountSol: lamportsToSol(raw.stakedAmount),
        yieldEarnedSol: lamportsToSol(raw.yieldEarned),
        pendingFeeSol: lamportsToSol(raw.pendingFee),
        totalDepositedSol: lamportsToSol(raw.totalDeposited),
        yieldRateBps: raw.yieldRateBps,
        yieldRatePercent: raw.yieldRateBps / 100,
        feeRateBps: raw.feeRateBps,
        feeRatePercent: raw.feeRateBps / 100,
        dailySpendProgressPct: dailyLimit > 0
            ? Math.min(100, Math.round((spentToday / dailyLimit) * 100))
            : 0,
    };
}
/**
 * Fetches and formats the vault state for a given (owner, agent) pair.
 */
async function getVaultState(client, ownerPubkey, agentPubkey) {
    const [vaultPda] = (0, pda_1.findVaultPda)(ownerPubkey, agentPubkey, client.programId);
    try {
        const raw = await client.program.account.agentVault.fetch(vaultPda);
        return formatVaultState(raw, vaultPda);
    }
    catch {
        return null;
    }
}
/**
 * Fetches vault state directly from a known PDA address.
 * Use this when the agent key on-chain might be zeroed out (Frozen).
 */
async function getVaultStateByAddress(client, vaultPda) {
    try {
        const raw = await client.program.account.agentVault.fetch(vaultPda);
        return formatVaultState(raw, vaultPda);
    }
    catch (err) {
        const msg = err?.message ?? String(err);
        // Anchor throws when the account simply doesn't exist — treat as null
        if (msg.includes("Account does not exist") ||
            msg.includes("has no data") ||
            msg.includes("could not find account")) {
            return null;
        }
        // Re-throw RPC / network / program errors so callers can classify them
        throw err;
    }
}
/**
 * Fetches the global ProtocolConfig.
 */
async function getProtocolConfig(client) {
    const [configPda] = (0, pda_1.findProtocolConfigPda)(client.programId);
    try {
        const raw = await client.program.account.protocolConfig.fetch(configPda);
        return {
            address: configPda,
            authority: raw.authority.toBase58(),
            treasury: raw.treasury.toBase58(),
            feeRateBps: raw.feeRateBps,
            feeRatePercent: raw.feeRateBps / 100,
        };
    }
    catch {
        return null;
    }
}
/**
 * Subscribes to vault state changes via WebSocket.
 */
function subscribeToVault(client, vaultPda, onUpdate) {
    const subId = client.connection.onAccountChange(vaultPda, async () => {
        const updated = await getVaultStateByAddress(client, vaultPda);
        onUpdate(updated);
    }, "confirmed");
    return () => {
        client.connection.removeAccountChangeListener(subId);
    };
}
//# sourceMappingURL=accounts.js.map