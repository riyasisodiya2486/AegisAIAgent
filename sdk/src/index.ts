// Main client class
export { AegisClient, DEVNET_PROGRAM_ID } from "./client";
export type { AegisClientConfig } from "./client";

// PDA helpers
export { findVaultPda, findProtocolConfigPda } from "./pda";

// Account fetchers + types
export {
  getVaultState,
  getVaultStateByAddress,
  getProtocolConfig,
  subscribeToVault,
} from "./accounts";
export type { VaultState, ProtocolConfigState } from "./accounts";

// Instruction builders
export {
  createVault,
  deposit,
  spend,
  revokeAgent,
  updateDailyLimit,
  withdrawAll,
  stakeIdleFunds,
  accrueYield,
  unstakeForSpend,
} from "./instructions";
export type { TxResult } from "./instructions";
