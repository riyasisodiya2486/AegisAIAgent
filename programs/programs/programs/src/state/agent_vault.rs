use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct AgentVault {
    pub owner: Pubkey,           // 32
    pub agent_key: Pubkey,       // 32
    pub daily_limit: u64,        // 8  (lamports)
    pub spent_today: u64,        // 8
    pub last_reset_ts: i64,      // 8
    pub vault_balance: u64,      // 8  (liquid lamports)
    pub total_deposited: u64,    // 8
    pub bump: u8,                // 1

    // --- Yield tracking fields ---
    pub staked_amount: u64,      // 8  lamports currently staked
    pub yield_earned: u64,       // 8  total lamports earned as yield
    pub last_yield_ts: i64,      // 8  timestamp of last yield accrual
    pub yield_rate_bps: u16,     // 2  annual yield in basis points (e.g. 800 = 8%)

        // --- Fee tracking ---
    pub pending_fee: u64,        // 8  lamports owed to protocol, not yet collected
    pub fee_rate_bps: u16,       // 2  copy of config fee rate, stored for transparency
}

impl AgentVault {
    pub const LEN: usize = 8    // discriminator
        + 32  // owner
        + 32  // agent_key
        + 8   // daily_limit
        + 8   // spent_today
        + 8   // last_reset_ts
        + 8   // vault_balance
        + 8   // total_deposited
        + 1   // bump
        + 8   // staked_amount
        + 8   // yield_earned
        + 8   // last_yield_ts
        + 2   // yield_rate_bps
        + 8   // pending_fee
        + 2;  // fee_rate_bps
               // Total: 149 bytes
}
