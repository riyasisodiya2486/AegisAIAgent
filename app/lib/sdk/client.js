"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AegisClient = exports.DEVNET_PROGRAM_ID = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const aegis_json_1 = __importDefault(require("./idl/aegis.json"));
const pda_1 = require("./pda");
exports.DEVNET_PROGRAM_ID = new web3_js_1.PublicKey(aegis_json_1.default.address);
class AegisClient {
    constructor(config) {
        this.programId = config.programId ?? exports.DEVNET_PROGRAM_ID;
        this.connection = config.connection;
        // Build a minimal wallet object compatible with AnchorProvider
        // without importing the deprecated Wallet type
        const wallet = {
            publicKey: config.wallet.publicKey,
            signTransaction: config.wallet.signTransaction,
            signAllTransactions: config.wallet.signAllTransactions,
            payer: {}, // AnchorProvider requires payer but it's unused in browser
        };
        const provider = new anchor_1.AnchorProvider(config.connection, wallet, { commitment: "confirmed", preflightCommitment: "confirmed" });
        (0, anchor_1.setProvider)(provider);
        this.program = new anchor_1.Program(aegis_json_1.default, provider);
        const [configPda] = (0, pda_1.findProtocolConfigPda)(this.programId);
        this.configPda = configPda;
    }
    static fromKeypair(keypair, rpcUrl) {
        const connection = new web3_js_1.Connection(rpcUrl ?? (0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
        const wallet = {
            publicKey: keypair.publicKey,
            signTransaction: async (tx) => {
                tx.sign([keypair]);
                return tx;
            },
            signAllTransactions: async (txs) => {
                txs.forEach((tx) => tx.sign([keypair]));
                return txs;
            },
        };
        return new AegisClient({ connection, wallet });
    }
}
exports.AegisClient = AegisClient;
//# sourceMappingURL=client.js.map