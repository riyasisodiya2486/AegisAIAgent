use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct UpdateLimit<'info> {
    #[account(
        mut,
        seeds = [
            b"aegis-vault",
            owner.key().as_ref(),
            vault.agent_key.as_ref(),
        ],
        bump = vault.bump,
        has_one = owner @ AegisError::UnauthorizedOwner,
    )]
    pub vault: Account<'info, AgentVault>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateLimit>, new_limit: u64) -> Result<()> {
    require!(new_limit > 0, AegisError::InvalidDailyLimit);
    ctx.accounts.vault.daily_limit = new_limit;
    msg!("Daily limit updated to {} lamports", new_limit);
    Ok(())
}
