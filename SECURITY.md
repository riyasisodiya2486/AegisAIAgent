# Aegis Security Model

## Trust Model

| Principal | Can do 				               | Cannot do             |
|-----------|--------------------------------------|-----------------------|
| Owner     | Deposit, withdraw, set limit, freeze | Spend as agent        |
| Agent     | Spend up to daily limit 		       | Withdraw, change limit, unfreeze |

## Properties

- Daily limit enforced in spend.rs at VM level
- Freeze zeroes agent_key — spend.rs rejects Pubkey::default
- original_agent_key preserved so frozen vaults remain withdrawable
- u128 arithmetic prevents overflow in yield calculations
- PDA derivation deterministic — no randomness

## Limitations

- Mock yield (not real Kamino)
- x402 replay protection in-memory only
- Hackathon software — not audited
