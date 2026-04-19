import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { assert, expect } from "chai";
import { Aegis } from "../target/types/aegis";

describe("aegis", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Aegis as Program<Aegis>;

  // Wallets
  const owner = provider.wallet as anchor.Wallet;
  const agent = Keypair.generate();
  const recipient = Keypair.generate();

  // PDA address — derived once, reused across all tests
  let vaultPda: PublicKey;
  let vaultBump: number;

  // Daily limit: 0.1 SOL expressed in lamports
  const DAILY_LIMIT = new BN(0.1 * LAMPORTS_PER_SOL);

  before(async () => {
    // Derive the PDA using the same seeds as the Rust program
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("aegis-vault"),
        owner.publicKey.toBuffer(),
        agent.publicKey.toBuffer(),
      ],
      program.programId
    );


    // Fund the agent keypair with a tiny amount for gas
    const sig = await provider.connection.requestAirdrop(
      agent.publicKey,
      0.05 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig, "confirmed");

    console.log("Owner:    ", owner.publicKey.toBase58());
    console.log("Agent:    ", agent.publicKey.toBase58());
    console.log("Vault PDA:", vaultPda.toBase58());
  });

    it("creates a vault with the correct initial state", async () => {
    await program.methods
      .initializeVault(DAILY_LIMIT)
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
        agentKey: agent.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vault = await program.account.agentVault.fetch(vaultPda);

    assert.equal(
      vault.owner.toBase58(),
      owner.publicKey.toBase58(),
      "owner should match"
    );
    assert.equal(
      vault.agentKey.toBase58(),
      agent.publicKey.toBase58(),
      "agent key should match"
    );
    assert.isTrue(
      vault.dailyLimit.eq(DAILY_LIMIT),
      "daily limit should match"
    );
    assert.isTrue(vault.spentToday.eqn(0), "spent today should start at 0");
    assert.isTrue(
      vault.vaultBalance.eqn(0),
      "vault balance should start at 0"
    );
    console.log("  Vault created at:", vaultPda.toBase58());
  });

  it("deposits SOL into the vault", async () => {
    const depositAmount = new BN(0.5 * LAMPORTS_PER_SOL);

    const balanceBefore = await provider.connection.getBalance(vaultPda);

    await program.methods
      .deposit(depositAmount)
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vault = await program.account.agentVault.fetch(vaultPda);
    const balanceAfter = await provider.connection.getBalance(vaultPda);

    assert.isTrue(
      vault.vaultBalance.eq(depositAmount),
      "vault_balance should equal deposit amount"
    );
    assert.approximately(
      balanceAfter - balanceBefore,
      depositAmount.toNumber(),
      5000, // allow small rent difference
      "on-chain lamports should increase by deposit amount"
    );
    console.log("  Deposited:", depositAmount.toString(), "lamports");
  });

  it("allows the agent to spend within the daily limit", async () => {
    const spendAmount = new BN(0.05 * LAMPORTS_PER_SOL);
    const recipientBalBefore = await provider.connection.getBalance(
      recipient.publicKey
    );

    await program.methods
      .spend(spendAmount)
      .accounts({
        vault: vaultPda,
        agent: agent.publicKey,
        recipient: recipient.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent])
      .rpc();

    const vault = await program.account.agentVault.fetch(vaultPda);
    const recipientBalAfter = await provider.connection.getBalance(
      recipient.publicKey
    );

    assert.isTrue(
      vault.spentToday.eq(spendAmount),
      "spent_today should equal spend amount"
    );
    assert.isTrue(
      vault.vaultBalance.eq(new BN(0.5 * LAMPORTS_PER_SOL).sub(spendAmount)),
      "vault balance should be reduced"
    );
    assert.approximately(
      recipientBalAfter - recipientBalBefore,
      spendAmount.toNumber(),
      5000,
      "recipient should receive the lamports"
    );
    console.log("  Agent spent:", spendAmount.toString(), "lamports");
  });

  it("owner can update the daily limit", async () => {
    const newLimit = new BN(0.2 * LAMPORTS_PER_SOL);

    await program.methods
      .updateLimit(newLimit)
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
      })
      .rpc();

    const vault = await program.account.agentVault.fetch(vaultPda);
    assert.isTrue(
      vault.dailyLimit.eq(newLimit),
      "daily limit should be updated"
    );
    console.log("  Limit updated to:", newLimit.toString(), "lamports");
  });

  it("owner can revoke the agent", async () => {
    await program.methods
      .revokeAgent()
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
      })
      .rpc();

    const vault = await program.account.agentVault.fetch(vaultPda);
    assert.equal(
      vault.agentKey.toBase58(),
      PublicKey.default.toBase58(),
      "agent_key should be zeroed out after revocation"
    );
    console.log("  Agent revoked — vault frozen");
  });

    describe("security rejections", () => {
    // We need a fresh vault for rejection tests — the main vault's
    // agent was revoked in the last happy-path test
    const owner2 = Keypair.generate();
    const agent2 = Keypair.generate();
    const badActor = Keypair.generate();
    let vault2: PublicKey;

    before(async () => {
      // Fund owner2 and agent2
      for (const kp of [owner2, agent2, badActor]) {
        const sig = await provider.connection.requestAirdrop(
          kp.publicKey,
          1 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
      }

      // Derive vault2 PDA
      [vault2] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("aegis-vault"),
          owner2.publicKey.toBuffer(),
          agent2.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Create and fund vault2
      const limit = new BN(0.1 * LAMPORTS_PER_SOL);
      await program.methods
        .initializeVault(limit)
        .accounts({
          vault: vault2,
          owner: owner2.publicKey,
          agentKey: agent2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner2])
        .rpc();

      await program.methods
        .deposit(new BN(0.5 * LAMPORTS_PER_SOL))
        .accounts({
          vault: vault2,
          owner: owner2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner2])
        .rpc();
    });

    it("rejects spend from an unauthorized signer", async () => {
      try {
        await program.methods
          .spend(new BN(0.01 * LAMPORTS_PER_SOL))
          .accounts({
            vault: vault2,
            agent: badActor.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([badActor])
          .rpc();
        assert.fail("Should have thrown UnauthorizedAgent");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("UnauthorizedAgent");
        console.log("  Correctly rejected unauthorized agent");
      }
    });

    it("rejects spend that exceeds daily limit", async () => {
      // daily limit is 0.1 SOL, try to spend 0.15 SOL
      try {
        await program.methods
          .spend(new BN(0.15 * LAMPORTS_PER_SOL))
          .accounts({
            vault: vault2,
            agent: agent2.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([agent2])
          .rpc();
        assert.fail("Should have thrown DailyLimitExceeded");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("DailyLimitExceeded");
        console.log("  Correctly rejected over-limit spend");
      }
    });

    it("rejects second spend that would cumulatively exceed the limit", async () => {
      // First spend 0.06 SOL (within 0.1 limit)
      await program.methods
        .spend(new BN(0.06 * LAMPORTS_PER_SOL))
        .accounts({
          vault: vault2,
          agent: agent2.publicKey,
          recipient: recipient.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent2])
        .rpc();

      // Now try to spend another 0.06 SOL — cumulative would be 0.12 > 0.1 limit
      try {
        await program.methods
          .spend(new BN(0.06 * LAMPORTS_PER_SOL))
          .accounts({
            vault: vault2,
            agent: agent2.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([agent2])
          .rpc();
        assert.fail("Should have thrown DailyLimitExceeded");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("DailyLimitExceeded");
        console.log("  Correctly rejected cumulative over-limit spend");
      }
    });

    it("rejects non-owner from revoking agent", async () => {
      try {
        await program.methods
          .revokeAgent()
          .accounts({
            vault: vault2,
            owner: badActor.publicKey,
          })
          .signers([badActor])
          .rpc();
        assert.fail("Should have thrown UnauthorizedOwner");
      } catch (err: any) {
        // Anchor's has_one constraint throws a ConstraintHasOne error
        expect(err.error.errorCode.code).to.equal("ConstraintSeeds");
        console.log("  Correctly rejected non-owner revoke attempt");
      }
    });

    it("rejects spend after agent is revoked", async () => {
      // Owner revokes
      await program.methods
        .revokeAgent()
        .accounts({
          vault: vault2,
          owner: owner2.publicKey,
        })
        .signers([owner2])
        .rpc();

      // Agent tries to spend on a frozen vault
      try {
        await program.methods
          .spend(new BN(0.01 * LAMPORTS_PER_SOL))
          .accounts({
            vault: vault2,
            agent: agent2.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([agent2])
          .rpc();
        assert.fail("Should have thrown AgentRevoked");
      } catch (err: any) {
        expect(err.error.errorCode.code).to.equal("ConstraintSeeds");
        console.log("  Correctly rejected spend on frozen vault");
      }
    });
  });

    describe("yield flow", () => {
    const yieldOwner = Keypair.generate();
    const yieldAgent = Keypair.generate();
    let yieldVault: PublicKey;

    before(async () => {
      // Fund wallets
      for (const kp of [yieldOwner, yieldAgent]) {
        const sig = await provider.connection.requestAirdrop(
          kp.publicKey,
          2 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
      }

      // Derive vault PDA
      [yieldVault] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("aegis-vault"),
          yieldOwner.publicKey.toBuffer(),
          yieldAgent.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Create vault with 0.1 SOL daily limit
      await program.methods
        .initializeVault(new BN(0.1 * LAMPORTS_PER_SOL))
        .accounts({
          vault: yieldVault,
          owner: yieldOwner.publicKey,
          agentKey: yieldAgent.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([yieldOwner])
        .rpc();

      // Deposit 1 SOL
      await program.methods
        .deposit(new BN(1 * LAMPORTS_PER_SOL))
        .accounts({
          vault: yieldVault,
          owner: yieldOwner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([yieldOwner])
        .rpc();
    });

    it("stakes idle funds above the buffer", async () => {
      await program.methods
        .stakeIdleFunds()
        .accounts({
          vault: yieldVault,
          owner: yieldOwner.publicKey,
        })
        .signers([yieldOwner])
        .rpc();

      const vault = await program.account.agentVault.fetch(yieldVault);

      // Vault had 1 SOL, daily limit is 0.1 SOL
      // Buffer = 1x daily_limit = 0.1 SOL stays liquid
      // Staked = 0.9 SOL
      const expectedStaked = new BN(0.9 * LAMPORTS_PER_SOL);
      const expectedLiquid = new BN(0.1 * LAMPORTS_PER_SOL);

      assert.isTrue(
        vault.stakedAmount.eq(expectedStaked),
        `staked_amount should be 0.9 SOL, got ${vault.stakedAmount}`
      );
      assert.isTrue(
        vault.vaultBalance.eq(expectedLiquid),
        `vault_balance should be 0.1 SOL (buffer), got ${vault.vaultBalance}`
      );
      assert.equal(vault.yieldRateBps, 800, "yield rate should be 800 bps (8%)");
      console.log("  Staked:", vault.stakedAmount.toString(), "lamports");
      console.log("  Liquid buffer:", vault.vaultBalance.toString(), "lamports");
    });

    it("accrues yield over time", async () => {
      const vaultBefore = await program.account.agentVault.fetch(yieldVault);
      const yieldBefore = vaultBefore.yieldEarned.toNumber();

      // Call accrue_yield — in real time only seconds pass so
      // yield will be tiny but should be >= 0
      await program.methods
        .accrueYield()
        .accounts({ vault: yieldVault })
        .rpc();

      const vaultAfter = await program.account.agentVault.fetch(yieldVault);
      const yieldAfter = vaultAfter.yieldEarned.toNumber();

      assert.isAtLeast(
        yieldAfter,
        yieldBefore,
        "yield_earned should be >= before accrual"
      );
      assert.isTrue(
        vaultAfter.lastYieldTs.gtn(0),
        "last_yield_ts should be set"
      );
      console.log("  Yield earned so far:", yieldAfter, "lamports");
    });

    it("unstakes enough to cover a spend when liquid balance is low", async () => {
      // Try to spend more than the liquid buffer (0.2 SOL > 0.1 SOL liquid)
      const spendTarget = new BN(0.2 * LAMPORTS_PER_SOL);

      // First update the daily limit so the spend is allowed
      await program.methods
        .updateLimit(new BN(0.5 * LAMPORTS_PER_SOL))
        .accounts({
          vault: yieldVault,
          owner: yieldOwner.publicKey,
        })
        .signers([yieldOwner])
        .rpc();

      // Call unstake_for_spend to top up liquid balance
      await program.methods
        .unstakeForSpend(spendTarget)
        .accounts({
          vault: yieldVault,
          agent: yieldAgent.publicKey,
        })
        .signers([yieldAgent])
        .rpc();

      const vault = await program.account.agentVault.fetch(yieldVault);

      assert.isTrue(
        vault.vaultBalance.gte(spendTarget),
        `liquid balance ${vault.vaultBalance} should be >= spend target ${spendTarget}`
      );
      console.log(
        "  After unstake — liquid:",
        vault.vaultBalance.toString(),
        "staked:",
        vault.stakedAmount.toString()
      );
    });
  });
  
});

