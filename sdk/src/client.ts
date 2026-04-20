import {
  AnchorProvider,
  Program,
  Idl,
  setProvider,
  Wallet,
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
  (IDL as Idl & { address: string }).address
);

export interface AegisClientConfig {
  connection: Connection;
  /** Wallet keypair used to sign transactions */
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: any) => Promise<any>;
    signAllTransactions: (txs: any[]) => Promise<any[]>;
  };
  
  /** Override program ID — defaults to IDL address */
  programId?: PublicKey;
}

export class AegisClient {
  public readonly program: Program<Aegis>;
  public readonly programId: PublicKey;
  public readonly configPda: PublicKey;
  public readonly connection: Connection;

  constructor(config: AegisClientConfig) {
    this.programId = config.programId ?? DEVNET_PROGRAM_ID;
    this.connection = config.connection;

    const provider = new AnchorProvider(
      config.connection,
      config.wallet,
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

  /** Convenience: create from a local keypair (for agent / scripts) */
  static fromKeypair(
    keypair: Keypair,
    rpcUrl?: string
  ): AegisClient {
    const connection = new Connection(
      rpcUrl ?? clusterApiUrl("devnet"),
      "confirmed"
    );

    // Minimal wallet adapter compatible with AnchorProvider
    const wallet = new Wallet(keypair);

    return new AegisClient({ 
      connection,
      wallet: wallet as any 
    });
  }
}
