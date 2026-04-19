use anchor_lang::prelude::*;

#[account]
pub struct ProtocolConfig {
    /// The wallet that is allowed to call collect_fees
    pub authority: Pubkey,       // 32
    /// Where collected fees are sent
    pub treasury: Pubkey,        // 32
    /// Fee rate in basis points — 500 = 5% of yield
    pub fee_rate_bps: u16,       // 2
    /// Bump for this config PDA
    pub bump: u8,                // 1
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + 32 + 32 + 2 + 1; // 75 bytes
    pub const FEE_RATE_BPS: u16 = 500; // 5% default
}
