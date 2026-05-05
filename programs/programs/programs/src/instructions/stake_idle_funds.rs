use anchor_lang::prelude::*;
use crate::state::{AgentVault, ProtocolConfig};
use crate::errors::AegisError;
use crate::utils::calculate_yield;

// Default yield rate: 8% APY expressed in basis points
const DEFAULT_YIELD_RATE_BPS: u16 = 800;

// Safety buffer: always keep at least 1x daily_limit liquid.
// Only stake the amount above this buffer.
// e.g. vault has 1 SOL, limit is 0.1 SOL → stake 0.9 SOL
const BUFFER_MULTIPLIER: u64 = 1;

#[derive(Accounts)]
pub struct StakeIdleFunds<'info> {
    #[account(
        mut,
        seeds = [
            b"aegis-vault",
            vault.owner.as_ref(),
            vault.original_agent_key.as_ref()
        ],
        bump = vault.bump,
        has_one = owner @ AegisError::UnauthorizedOwner,
    )]
    pub vault: Account<'info, AgentVault>,

    #[account(
        seeds = [b"aegis-protocol-config"],
        bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<StakeIdleFunds>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    // --- Accrue any pending yield on already-staked amount ---
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
    }

    // --- Calculate how much to stake ---
    // Keep (daily_limit * BUFFER_MULTIPLIER) liquid; stake the rest
    let buffer = vault.daily_limit
        .checked_mul(BUFFER_MULTIPLIER)
        .unwrap_or(vault.daily_limit);

    let stakeable = vault.vault_balance.saturating_sub(buffer);

    require!(stakeable > 0, AegisError::InsufficientFunds);

    // --- Move funds from liquid to staked bucket ---
    vault.vault_balance = vault.vault_balance
        .checked_sub(stakeable)
        .ok_or(AegisError::InsufficientFunds)?;

    vault.staked_amount = vault.staked_amount
        .checked_add(stakeable)
        .unwrap_or(vault.staked_amount);

    // Set yield rate if not already configured
    if vault.yield_rate_bps == 0 {
        vault.yield_rate_bps = DEFAULT_YIELD_RATE_BPS;
    }

    vault.fee_rate_bps = ctx.accounts.config.fee_rate_bps;
    vault.last_yield_ts = clock.unix_timestamp;

    msg!(
        "Staked {} lamports. Total staked: {}. Yield rate: {} bps, Protocol Fee: {} bps",
        stakeable,
        vault.staked_amount,
        vault.yield_rate_bps,
        vault.fee_rate_bps
    );

    Ok(())
}
