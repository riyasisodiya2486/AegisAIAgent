use anchor_lang::prelude::*;
use crate::state::{AgentVault, ProtocolConfig};
use crate::utils::calculate_yield;

#[derive(Accounts)]
pub struct AccrueYield<'info> {
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

    /// Global protocol config — read-only here, just need fee_rate_bps
    #[account(
        seeds = [b"aegis-protocol-config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,
}

pub fn handler(ctx: Context<AccrueYield>) -> Result<()> {
    let config_fee_rate = ctx.accounts.config.fee_rate_bps;
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    if vault.staked_amount == 0 || vault.yield_rate_bps == 0 {
        return Ok(());
    }

    let gross_yield = calculate_yield(
        vault.staked_amount,
        vault.yield_rate_bps,
        vault.last_yield_ts,
        clock.unix_timestamp,
    );

    if gross_yield == 0 {
        return Ok(());
    }

    // --- Fee split: 5% to protocol, 95% to user ---
    // fee = gross_yield * fee_rate_bps / 10_000
    let fee_amount = (gross_yield as u128)
        .saturating_mul(config_fee_rate as u128)
        / 10_000u128;
    let fee_amount = fee_amount as u64;

    let user_yield = gross_yield.saturating_sub(fee_amount);

    // Accumulate both
    vault.yield_earned = vault.yield_earned
        .checked_add(user_yield)
        .unwrap_or(vault.yield_earned);

    vault.pending_fee = vault.pending_fee
        .checked_add(fee_amount)
        .unwrap_or(vault.pending_fee);

    // Store the current fee rate for transparency / frontend display
    vault.fee_rate_bps = config_fee_rate;

    vault.last_yield_ts = clock.unix_timestamp;

    msg!(
        "Yield accrued — user: {} lamports, protocol fee: {} lamports",
        user_yield,
        fee_amount
    );

    Ok(())
}
