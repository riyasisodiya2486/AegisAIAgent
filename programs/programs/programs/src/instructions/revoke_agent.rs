use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct RevokeAgent<'info> {
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

pub fn handler(ctx: Context<RevokeAgent>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    // Setting agent_key to the default (all-zeros) pubkey effectively
    // freezes the agent — the spend instruction checks for this
    vault.agent_key = Pubkey::default();

    msg!("Agent revoked. Vault is now frozen.");
    Ok(())
}
