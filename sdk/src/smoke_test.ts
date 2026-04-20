import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";
import { AegisClient } from "./client";
import {
  createVault,
  deposit,
  stakeIdleFunds,
  accrueYield,
} from "./instructions";
import { getVaultState } from "./accounts";
import { findVaultPda } from "./pda";

async function main() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // Load the local deployer keypair from the Solana CLI default path
  const fs = await import("fs");
  const raw = JSON.parse(
    fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf-8")
  );
  const owner = Keypair.fromSecretKey(Uint8Array.from(raw));

  // Generate a fresh agent keypair for this test
  const agent = Keypair.generate();

  console.log("\nOwner:", owner.publicKey.toBase58());
  console.log("Agent:", agent.publicKey.toBase58());

  const client = AegisClient.fromKeypair(owner,  "http://127.0.0.1:8899");

  // --- Step 1: Create vault ---
  console.log("\n[1] Creating vault with 0.1 SOL daily limit...");
  const { vaultAddress } = await createVault(
    client,
    owner.publicKey,
    agent.publicKey,
    0.1
  );
  console.log("    Vault PDA:", vaultAddress.toBase58());

  // --- Step 2: Deposit ---
  console.log("\n[2] Depositing 0.5 SOL...");
  const { signature: depSig } = await deposit(
    client,
    owner.publicKey,
    agent.publicKey,
    0.5
  );
  console.log("    Tx:", depSig);

  // --- Step 3: Read vault state ---
  console.log("\n[3] Fetching vault state...");
  const state = await getVaultState(client, owner.publicKey, agent.publicKey);
  if (!state) throw new Error("Vault not found!");

  console.log("    Balance:      ", state.vaultBalanceSol.toFixed(4), "SOL");
  console.log("    Daily limit:  ", state.dailyLimitSol.toFixed(4), "SOL");
  console.log("    Spent today:  ", state.spentTodaySol.toFixed(4), "SOL");
  console.log("    Remaining:    ", state.remainingTodaySol.toFixed(4), "SOL");
  console.log("    Frozen:       ", state.isFrozen);

  // --- Step 4: Stake idle funds ---
  console.log("\n[4] Staking idle funds...");
  const stakeSig = await stakeIdleFunds(
    client,
    owner.publicKey,
    agent.publicKey
  );
  console.log("    Tx:", stakeSig);

  // --- Step 5: Accrue yield ---
  console.log("\n[5] Accruing yield...");
  const [vaultPda] = findVaultPda(
    owner.publicKey,
    agent.publicKey,
    client.programId
  );
  const yieldSig = await accrueYield(client, vaultPda);
  console.log("    Tx:", yieldSig);

  // --- Step 6: Read final state ---
  const finalState = await getVaultState(
    client,
    owner.publicKey,
    agent.publicKey
  );
  if (!finalState) throw new Error("Vault disappeared!");

  console.log("\n[6] Final vault state:");
  console.log("    Liquid balance: ", finalState.vaultBalanceSol.toFixed(6), "SOL");
  console.log("    Staked:         ", finalState.stakedAmountSol.toFixed(6), "SOL");
  console.log("    Yield earned:   ", finalState.yieldEarnedSol.toFixed(9), "SOL");
  console.log("    Pending fee:    ", finalState.pendingFeeSol.toFixed(9), "SOL");
  console.log("    Yield rate:     ", finalState.yieldRatePercent.toFixed(2), "%");
  console.log("    Daily progress: ", finalState.dailySpendProgressPct, "%");

  console.log("\nSmoke test passed.");
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
