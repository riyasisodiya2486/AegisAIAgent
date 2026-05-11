export { AegisClient, DEVNET_PROGRAM_ID } from "./client";
export type { AegisClientConfig } from "./client";
export { findVaultPda, findProtocolConfigPda } from "./pda";
export { getVaultState, getVaultStateByAddress, getProtocolConfig, subscribeToVault, } from "./accounts";
export type { VaultState, ProtocolConfigState } from "./accounts";
export { createVault, deposit, spend, revokeAgent, updateDailyLimit, withdrawAll, stakeIdleFunds, accrueYield, unstakeForSpend, } from "./instructions";
export type { TxResult } from "./instructions";
//# sourceMappingURL=index.d.ts.map