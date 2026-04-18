use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
#[instruction(daily_limit: u64)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = owner,
        space = AgentVault::LEN,
        seeds = [
            b"aegis-vault",
            owner.key().as_ref(),
            agent_key.key().as_ref(),
        ],
        bump
    )]
    pub vault: Account<'info, AgentVault>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: This is the agent's pubkey — not a signer here,
    /// just stored as the authorized spender. Validated in spend.
    pub agent_key: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeVault>,
    daily_limit: u64,
) -> Result<()> {
    require!(daily_limit > 0, AegisError::InvalidDailyLimit);

    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    vault.owner = ctx.accounts.owner.key();
    vault.agent_key = ctx.accounts.agent_key.key();
    vault.daily_limit = daily_limit;
    vault.spent_today = 0;
    vault.last_reset_ts = clock.unix_timestamp;
    vault.vault_balance = 0;
    vault.total_deposited = 0;
    vault.bump = ctx.bumps.vault;

    msg!(
        "Vault created for agent {:?} with daily limit {} lamports",
        vault.agent_key,
        vault.daily_limit
    );

    Ok(())
}
