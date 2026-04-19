use anchor_lang::prelude::*;
use crate::state::ProtocolConfig;

#[derive(Accounts)]
pub struct InitializeProtocolConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = ProtocolConfig::LEN,
        seeds = [b"aegis-protocol-config"],
        bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// The deployer / team keypair — becomes the authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This is the treasury wallet that receives fees.
    /// Can be any valid pubkey — a multisig, a team wallet, etc.
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeProtocolConfig>) -> Result<()> {
    let config = &mut ctx.accounts.config;

    config.authority = ctx.accounts.authority.key();
    config.treasury = ctx.accounts.treasury.key();
    config.fee_rate_bps = ProtocolConfig::FEE_RATE_BPS; // 500 = 5%
    config.bump = ctx.bumps.config;

    msg!(
        "Protocol config initialized. Treasury: {:?}, Fee: {} bps",
        config.treasury,
        config.fee_rate_bps
    );

    Ok(())
}
