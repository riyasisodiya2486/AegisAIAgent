import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Aegis } from "./types/aegis";
export declare const DEVNET_PROGRAM_ID: PublicKey;
export interface AegisClientConfig {
    connection: Connection;
    wallet: {
        publicKey: PublicKey;
        signTransaction: (tx: any) => Promise<any>;
        signAllTransactions: (txs: any[]) => Promise<any[]>;
    };
    programId?: PublicKey;
}
export declare class AegisClient {
    readonly program: Program<Aegis>;
    readonly programId: PublicKey;
    readonly configPda: PublicKey;
    readonly connection: Connection;
    constructor(config: AegisClientConfig);
    static fromKeypair(keypair: Keypair, rpcUrl?: string): AegisClient;
}
//# sourceMappingURL=client.d.ts.map