"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AEGIS_CONFIG_SEED = exports.AEGIS_VAULT_SEED = void 0;
exports.findVaultPda = findVaultPda;
exports.findProtocolConfigPda = findProtocolConfigPda;
const web3_js_1 = require("@solana/web3.js");
exports.AEGIS_VAULT_SEED = Buffer.from("aegis-vault");
exports.AEGIS_CONFIG_SEED = Buffer.from("aegis-protocol-config");
/**
 * Derives the PDA address for a specific (owner, agent) vault pair.
 * Seeds must match the Rust program exactly.
 */
function findVaultPda(ownerPubkey, agentPubkey, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        exports.AEGIS_VAULT_SEED,
        ownerPubkey.toBuffer(),
        agentPubkey.toBuffer(),
    ], programId);
}
/**
 * Derives the singleton ProtocolConfig PDA.
 * There is exactly one per program deployment.
 */
function findProtocolConfigPda(programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([exports.AEGIS_CONFIG_SEED], programId);
}
//# sourceMappingURL=pda.js.map