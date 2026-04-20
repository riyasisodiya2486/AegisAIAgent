import { PublicKey } from "@solana/web3.js";

export const AEGIS_VAULT_SEED = Buffer.from("aegis-vault");
export const AEGIS_CONFIG_SEED = Buffer.from("aegis-protocol-config");

/**
 * Derives the PDA address for a specific (owner, agent) vault pair.
 * Seeds must match the Rust program exactly.
 */
export function findVaultPda(
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      AEGIS_VAULT_SEED,
      ownerPubkey.toBuffer(),
      agentPubkey.toBuffer(),
    ],
    programId
  );
}

/**
 * Derives the singleton ProtocolConfig PDA.
 * There is exactly one per program deployment.
 */
export function findProtocolConfigPda(
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [AEGIS_CONFIG_SEED],
    programId
  );
}
