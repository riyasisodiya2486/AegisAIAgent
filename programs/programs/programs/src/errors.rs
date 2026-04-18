use anchor_lang::prelude::*;

#[error_code]
pub enum AegisError {
    #[msg("Signer is not the authorized agent for this vault")]
    UnauthorizedAgent,

    #[msg("This transaction would exceed the vault's daily spending limit")]
    DailyLimitExceeded,

    #[msg("Vault has insufficient balance for this transaction")]
    InsufficientFunds,

    #[msg("Only the vault owner can perform this action")]
    UnauthorizedOwner,

    #[msg("Daily limit must be greater than zero")]
    InvalidDailyLimit,

    #[msg("Deposit amount must be greater than zero")]
    InvalidDepositAmount,

    #[msg("Agent has been revoked — vault is frozen")]
    AgentRevoked,
}