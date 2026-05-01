import {
  AnchorProvider,
  Program,
  Idl,
  setProvider,
} from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";
import { Aegis } from "./types/aegis";
import IDL from "./idl/aegis.json";
import { findProtocolConfigPda } from "./pda";

export const DEVNET_PROGRAM_ID = new PublicKey(
  (IDL as any).address
);

export interface AegisClientConfig {
  connection: Connection;
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: any) => Promise<any>;
    signAllTransactions: (txs: any[]) => Promise<any[]>;
  };
  programId?: PublicKey;
}

export class AegisClient {
  public readonly program: Program<Aegis>;
  public readonly programId: PublicKey;
  public readonly configPda: PublicKey;
  public readonly connection: Connection;

  constructor(config: AegisClientConfig) {
    this.programId  = config.programId ?? DEVNET_PROGRAM_ID;
    this.connection = config.connection;

    // Build a minimal wallet object compatible with AnchorProvider
    // without importing the deprecated Wallet type
    const wallet = {
      publicKey:           config.wallet.publicKey,
      signTransaction:     config.wallet.signTransaction,
      signAllTransactions: config.wallet.signAllTransactions,
      payer:               {} as any, // AnchorProvider requires payer but it's unused in browser
    };

    const provider = new AnchorProvider(
      config.connection,
      wallet as any,
      { commitment: "confirmed", preflightCommitment: "confirmed" }
    );
    setProvider(provider);

    this.program = new Program<Aegis>(
      IDL as unknown as Aegis,
      provider
    );

    const [configPda] = findProtocolConfigPda(this.programId);
    this.configPda = configPda;
  }

  static fromKeypair(keypair: Keypair, rpcUrl?: string): AegisClient {
    const connection = new Connection(
      rpcUrl ?? clusterApiUrl("devnet"),
      "confirmed"
    );

    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.sign([keypair]);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach((tx) => tx.sign([keypair]));
        return txs;
      },
    };

    return new AegisClient({ connection, wallet });
  }
}