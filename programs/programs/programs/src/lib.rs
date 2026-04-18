use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

// We bring everything into the root of the crate so the macro finds it
pub use instructions::initialize_vault::*;
pub use instructions::deposit::*;
pub use instructions::spend::*;
pub use instructions::revoke_agent::*;
pub use instructions::update_limit::*;
pub use instructions::withdraw::*;

declare_id!("EnAS1LC6Rgj993Zt16LwYYSNFWEgRL4VbnarbyRQATAQ");

#[program]
pub mod aegis {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, daily_limit: u64) -> Result<()> {
        instructions::initialize_vault::handler(ctx, daily_limit)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }

    pub fn spend(ctx: Context<Spend>, amount: u64) -> Result<()> {
        instructions::spend::handler(ctx, amount)
    }

    pub fn revoke_agent(ctx: Context<RevokeAgent>) -> Result<()> {
        instructions::revoke_agent::handler(ctx)
    }

    pub fn update_limit(ctx: Context<UpdateLimit>, new_limit: u64) -> Result<()> {
        instructions::update_limit::handler(ctx, new_limit)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        instructions::withdraw::handler(ctx)
    }
}