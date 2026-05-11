import { PublicKey } from "@solana/web3.js";
export declare const AEGIS_VAULT_SEED: Buffer<ArrayBuffer>;
export declare const AEGIS_CONFIG_SEED: Buffer<ArrayBuffer>;
/**
 * Derives the PDA address for a specific (owner, agent) vault pair.
 * Seeds must match the Rust program exactly.
 */
export declare function findVaultPda(ownerPubkey: PublicKey, agentPubkey: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Derives the singleton ProtocolConfig PDA.
 * There is exactly one per program deployment.
 */
export declare function findProtocolConfigPda(programId: PublicKey): [PublicKey, number];
//# sourceMappingURL=pda.d.ts.map