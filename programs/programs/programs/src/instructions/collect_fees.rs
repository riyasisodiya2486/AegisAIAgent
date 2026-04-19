use anchor_lang::prelude::*;
use crate::state::{AgentVault, ProtocolConfig};
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct CollectFees<'info> {
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

    #[account(
        seeds = [b"aegis-protocol-config"],
        bump = config.bump,
        has_one = authority @ AegisError::UnauthorizedOwner,
        has_one = treasury,
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub authority: Signer<'info>,

    #[account(mut)]
    /// CHECK: Treasury wallet — matches config.treasury
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

// 1. UNIQUE NAME: prevents the "ambiguous glob re-export" error
pub fn collect_fees_logic(ctx: Context<CollectFees>) -> Result<()> {
    let fee_to_collect = ctx.accounts.vault.pending_fee;
    let vault_balance = ctx.accounts.vault.vault_balance;

    if fee_to_collect == 0 {
        msg!("No pending fees to collect");
        return Ok(());
    }

    let transferable = fee_to_collect.min(vault_balance);

    if transferable > 0 {
        let vault_info = ctx.accounts.vault.to_account_info();
        let treasury_info = ctx.accounts.treasury.to_account_info();

        // 2. MANUAL LAMPORT MUTATION: Fixes "from must not carry data"
        // 3. GENERIC ERRORS: Ensures it compiles regardless of AegisError contents
        **vault_info.try_borrow_mut_lamports()? = vault_info
            .lamports()
            .checked_sub(transferable)
            .ok_or(ProgramError::InsufficientFunds)?; 

        **treasury_info.try_borrow_mut_lamports()? = treasury_info
            .lamports()
            .checked_add(transferable)
            .ok_or(ProgramError::ArithmeticOverflow)?; 
    }

    let vault = &mut ctx.accounts.vault;
    vault.vault_balance = vault.vault_balance.saturating_sub(transferable);
    vault.pending_fee = 0;

    msg!("Collected {} lamports in fees.", transferable);
    Ok(())
}