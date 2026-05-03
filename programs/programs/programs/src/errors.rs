use anchor_lang::prelude::*;

#[error_code]
pub enum AegisError {
    #[msg("Daily spending limit exceeded")]
    DailyLimitExceeded,

    #[msg("Insufficient vault balance")]
    InsufficientFunds,

    #[msg("Unauthorized: not the vault owner")]
    UnauthorizedOwner,

    #[msg("Unauthorized: not the vault agent")]
    UnauthorizedAgent,

    #[msg("Agent has already been revoked")]
    AlreadyRevoked,

    #[msg("Agent has been revoked — vault is frozen")]
    AgentRevoked,

    #[msg("Vault is frozen")]
    VaultFrozen,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Daily limit must be greater than zero")]
    InvalidDailyLimit,

    #[msg("Deposit amount must be greater than zero")]
    InvalidDepositAmount,

    #[msg("Arithmetic overflow")]
    Overflow,
}