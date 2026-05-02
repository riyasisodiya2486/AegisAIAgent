use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct RevokeAgent<'info> {
    #[account(
        mut,
        // KEY FIX: use a separate original_agent_key account for seed derivation
        // so the PDA address never changes after freeze
        seeds = [
            b"aegis-vault",
            owner.key().as_ref(),
            original_agent_key.key().as_ref(),
        ],
        bump = vault.bump,
        has_one = owner @ AegisError::UnauthorizedOwner,
    )]
    pub vault: Account<'info, AgentVault>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: The original agent key used to derive this PDA.
    /// Must match the key stored in vault.agent_key OR vault.original_agent_key.
    pub original_agent_key: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<RevokeAgent>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    // Store original key before zeroing it, so withdraw can still find the vault
    vault.original_agent_key = vault.agent_key;

    // Zero out agent_key to freeze spending
    vault.agent_key = Pubkey::default();

    msg!("Agent revoked. Vault is frozen. Original key preserved for PDA derivation.");
    Ok(())
}