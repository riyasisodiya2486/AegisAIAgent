use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct AccrueYield<'info> {
    #[account(
        mut,
        seeds = [
            b"aegis-vault",
            vault.owner.as_ref(),
            vault.original_agent_key.as_ref(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info, AgentVault>,
}

pub fn handler(ctx: Context<AccrueYield>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    let now          = Clock::get()?.unix_timestamp;
    let elapsed_secs = (now - vault.last_yield_ts).max(0) as u64;

    if vault.staked_amount == 0 || elapsed_secs == 0 {
        msg!("Nothing to accrue: staked={}, elapsed={}s", vault.staked_amount, elapsed_secs);
        return Ok(());
    }

    // yield = staked * rate_bps * elapsed / (10000 * 365 * 86400)
    // Use u128 to avoid overflow in intermediate calculation
    let yield_amount = (vault.staked_amount as u128)
        .checked_mul(vault.yield_rate_bps as u128)
        .ok_or(AegisError::Overflow)?
        .checked_mul(elapsed_secs as u128)
        .ok_or(AegisError::Overflow)?
        .checked_div(10_000u128 * 365 * 86_400)
        .ok_or(AegisError::Overflow)? as u64;

    if yield_amount == 0 {
        msg!("Yield too small to accrue yet");
        return Ok(());
    }

    // Protocol fee — disabled for mock yield to prevent draining real lamports
    let fee = 0;

    let net_yield = yield_amount.saturating_sub(fee);

    // Track yield earned (for dashboard display) WITHOUT adding to vault_balance.
    // vault_balance must only reflect real physical lamports deposited into the PDA.
    // Adding fake lamports here would cause spend.rs to panic with InsufficientFunds
    // when the AI agent tried to spend the "yielded" balance.
    vault.yield_earned  = vault.yield_earned.saturating_add(net_yield);
    vault.pending_fee   = vault.pending_fee.saturating_add(fee);
    vault.last_yield_ts = now;

    msg!(
        "Accrued {} lamports yield ({} fee) over {}s",
        net_yield, fee, elapsed_secs
    );
    Ok(())
}