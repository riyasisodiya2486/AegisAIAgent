use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct Deposit<'info> {
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

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, AegisError::InvalidDepositAmount);

    let vault_account_info = ctx.accounts.vault.to_account_info();

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.key(), 
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: vault_account_info,
            },
        ),
        amount,
    )?;

    let vault = &mut ctx.accounts.vault;
    vault.vault_balance = vault.vault_balance.checked_add(amount)
        .ok_or(AegisError::InsufficientFunds)?;
    vault.total_deposited = vault.total_deposited.checked_add(amount)
        .ok_or(AegisError::InsufficientFunds)?;

    Ok(())
}