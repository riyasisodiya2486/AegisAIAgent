use anchor_lang::prelude::*;
use crate::state::AgentVault;
use crate::errors::AegisError;

#[derive(Accounts)]
pub struct Spend<'info> {
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

    // The AI agent must sign this transaction
    pub agent: Signer<'info>,

    /// CHECK: Recipient of the payment — any valid pubkey
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Spend>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;

    // 1. Logic & Validation
    // We update the state first. 
    // The vault borrow is handled inside this block to avoid reference conflicts later.
    {
        let vault = &mut ctx.accounts.vault;

        require!(ctx.accounts.agent.key() == vault.agent_key, AegisError::UnauthorizedAgent);
        require!(vault.agent_key != Pubkey::default(), AegisError::AgentRevoked);
        require!(vault.vault_balance >= amount, AegisError::InsufficientFunds);

        let seconds_elapsed = clock.unix_timestamp.checked_sub(vault.last_reset_ts).unwrap_or(0);
        if seconds_elapsed >= 86_400 {
            vault.spent_today = 0;
            vault.last_reset_ts = clock.unix_timestamp;
        }

        let new_spent = vault.spent_today.checked_add(amount).ok_or(AegisError::DailyLimitExceeded)?;
        require!(new_spent <= vault.daily_limit, AegisError::DailyLimitExceeded);

        // Update internal state tracking
        vault.spent_today = new_spent;
        vault.vault_balance = vault.vault_balance.checked_sub(amount).ok_or(AegisError::InsufficientFunds)?;
    }

    // 2. Direct Lamport Transfer
    // We bypass system_program::transfer because the vault PDA carries data.
    let vault_info = ctx.accounts.vault.to_account_info();
    let recipient_info = ctx.accounts.recipient.to_account_info();

    // Verify the vault has enough actual lamports (rent-exempt minimum + amount)
    let rent_exempt_minimum = Rent::get()?.minimum_balance(vault_info.data_len());
    let current_lamports = vault_info.lamports();
    
    require!(
        current_lamports.checked_sub(amount).unwrap_or(0) >= rent_exempt_minimum,
        AegisError::InsufficientFunds
    );

    // Perform the transfer by modifying lamport balances directly
    **vault_info.try_borrow_mut_lamports()? = vault_info
        .lamports()
        .checked_sub(amount)
        .ok_or(AegisError::InsufficientFunds)?;

    **recipient_info.try_borrow_mut_lamports()? = recipient_info
        .lamports()
        .checked_add(amount)
        .ok_or(AegisError::InsufficientFunds)?;

    Ok(())
}