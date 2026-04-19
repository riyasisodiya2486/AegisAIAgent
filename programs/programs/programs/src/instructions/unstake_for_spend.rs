use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;
use crate::utils::calculate_yield;

#[derive(Accounts)]
pub struct UnstakeForSpend<'info> {
    #[account(
        mut,
        seeds = [
            b"aegis-vault",
            vault.owner.as_ref(),
            vault.agent_key.as_ref(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info, AgentVault>,

    // The agent triggers unstaking when it needs to spend
    pub agent: Signer<'info>,
}

pub fn handler(ctx: Context<UnstakeForSpend>, amount_needed: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    // Verify caller is the registered agent
    require!(
        ctx.accounts.agent.key() == vault.agent_key,
        AegisError::UnauthorizedAgent
    );

    // If liquid balance already covers the spend, no unstaking needed
    if vault.vault_balance >= amount_needed {
        return Ok(());
    }

    // --- Accrue pending yield before unstaking ---
    if vault.staked_amount > 0 {
        let accrued = calculate_yield(
            vault.staked_amount,
            vault.yield_rate_bps,
            vault.last_yield_ts,
            clock.unix_timestamp,
        );
        vault.yield_earned = vault.yield_earned
            .checked_add(accrued)
            .unwrap_or(vault.yield_earned);
        vault.last_yield_ts = clock.unix_timestamp;
    }

    // Calculate how much to unstake
    let shortfall = amount_needed
        .checked_sub(vault.vault_balance)
        .unwrap_or(0);

    let unstake_amount = shortfall.min(vault.staked_amount);

    require!(
        vault.vault_balance.checked_add(unstake_amount).unwrap_or(0) >= amount_needed,
        AegisError::InsufficientFunds
    );

    // Move from staked to liquid
    vault.staked_amount = vault.staked_amount
        .checked_sub(unstake_amount)
        .ok_or(AegisError::InsufficientFunds)?;

    vault.vault_balance = vault.vault_balance
        .checked_add(unstake_amount)
        .unwrap_or(vault.vault_balance);

    msg!(
        "Unstaked {} lamports for spend. Liquid: {}, Staked: {}",
        unstake_amount,
        vault.vault_balance,
        vault.staked_amount
    );

    Ok(())
}
