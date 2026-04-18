use anchor_lang::prelude::*;
// use anchor_lang::system_program;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [
            b"aegis-vault",
            owner.key().as_ref(),
            vault.agent_key.as_ref(),
        ],
        bump = vault.bump,
        has_one = owner @ AegisError::UnauthorizedOwner,
        close = owner,
    )]
    pub vault: Account<'info, AgentVault>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Withdraw>) -> Result<()> {
    // The `close = owner` constraint on the account handles everything:
    // it transfers all lamports back to owner and zeroes the account data.
    // We just need to log the action.
    msg!(
        "Vault closed. All funds returned to owner {}",
        ctx.accounts.owner.key()
    );
    Ok(())
}
