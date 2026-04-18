use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct AgentVault {
    pub owner: Pubkey,           // 32 bytes
    pub agent_key: Pubkey,       // 32 bytes
    pub daily_limit: u64,        // 8 bytes (in lamports)
    pub spent_today: u64,        // 8 bytes
    pub last_reset_ts: i64,      // 8 bytes
    pub vault_balance: u64,      // 8 bytes
    pub total_deposited: u64,    // 8 bytes
    pub bump: u8,                // 1 byte
}

impl AgentVault {
    pub const LEN: usize = 8     // Discriminator (Anchor's internal ID)
        + 32  // owner
        + 32  // agent_key
        + 8   // daily_limit
        + 8   // spent_today
        + 8   // last_reset_ts
        + 8   // vault_balance
        + 8   // total_deposited
        + 1;  // bump
}
