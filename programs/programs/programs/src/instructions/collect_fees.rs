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
            vault.original_agent_key.as_ref(),
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
    // Use actual lamports available, keeping rent exemption in mind
    let vault_info = ctx.accounts.vault.to_account_info();
    let rent_exempt_min = Rent::get()?.minimum_balance(vault_info.data_len());
    let current_lamports = vault_info.lamports();
    
    // Calculate how much we can actually take right now
    let max_withdrawable = current_lamports.saturating_sub(rent_exempt_min);
    let transferable = fee_to_collect.min(max_withdrawable);

    if fee_to_collect == 0 {
        msg!("No pending fees to collect");
        return Ok(());
    }

    if transferable > 0 {
        let treasury_info = ctx.accounts.treasury.to_account_info();

        // Perform the manual transfer
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
    
    // UPDATE: Only reduce the fee by what was actually paid
    vault.pending_fee = vault.pending_fee.saturating_sub(transferable);
    
    // Synchronize the internal balance tracker
    vault.vault_balance = vault.vault_balance.saturating_sub(transferable);

    msg!(
        "Collected {} lamports. Remaining debt: {} lamports.", 
        transferable, 
        vault.pending_fee
    );
    
    Ok(())
}