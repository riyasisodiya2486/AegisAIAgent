use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

// We use "pub use" here so the macro can see into the sub-modules
pub use instructions::initialize_vault::*;
pub use instructions::deposit::*;

declare_id!("8dEjTZ3pzqTvBDyJdgmYQja8danJh5Mv1A886vaYQqVB");

#[program]
pub mod aegis {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        daily_limit: u64,
    ) -> Result<()> {
        instructions::initialize_vault::handler(ctx, daily_limit)
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }
}