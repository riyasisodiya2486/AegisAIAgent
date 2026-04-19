use anchor_lang::prelude::*;
use crate::state::AgentVault;
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
}

/// Permissionless crank — anyone can call this to update yield.
/// The frontend calls it on page load to show fresh numbers.
pub fn handler(ctx: Context<AccrueYield>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    if vault.staked_amount == 0 || vault.yield_rate_bps == 0 {
        return Ok(()); // nothing to accrue
    }

    let accrued = calculate_yield(
        vault.staked_amount,
        vault.yield_rate_bps,
        vault.last_yield_ts,
        clock.unix_timestamp,
    );

    if accrued > 0 {
        vault.yield_earned = vault.yield_earned
            .checked_add(accrued)
            .unwrap_or(vault.yield_earned);
        vault.last_yield_ts = clock.unix_timestamp;

        msg!("Accrued {} lamports yield. Total earned: {}", accrued, vault.yield_earned);
    }

    Ok(())
}
