/// Calculates yield earned since last_yield_ts using simple interest.
///
/// Formula: principal * rate_bps * seconds_elapsed
///          ----------------------------------------
///               10_000 * seconds_per_year
///
/// Returns lamports earned (floors to zero if elapsed time is tiny).
pub fn calculate_yield(
    principal: u64,
    rate_bps: u16,
    last_yield_ts: i64,
    current_ts: i64,
) -> u64 {
    if principal == 0 || rate_bps == 0 {
        return 0;
    }

    let seconds_elapsed = current_ts
        .saturating_sub(last_yield_ts)
        .max(0) as u128;

    // Avoid integer overflow by using u128 for intermediate multiplication
    let yield_lamports = (principal as u128)
        .saturating_mul(rate_bps as u128)
        .saturating_mul(seconds_elapsed)
        / (10_000u128 * 365 * 24 * 3600); // annual basis

    yield_lamports as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_yield_one_year_8_percent() {
        let principal = 1_000_000_000u64; // 1 SOL in lamports
        let rate_bps = 800u16;            // 8% APY
        let start_ts = 0i64;
        let end_ts = 365 * 24 * 3600i64; // exactly 1 year

        let earned = calculate_yield(principal, rate_bps, start_ts, end_ts);
        // Expected: 80_000_000 lamports = 0.08 SOL
        assert!(earned > 79_000_000 && earned <= 80_000_000,
            "1 year 8% yield on 1 SOL should be ~0.08 SOL, got {}", earned);
    }

    #[test]
    fn test_yield_zero_principal() {
        assert_eq!(calculate_yield(0, 800, 0, 86400), 0);
    }

    #[test]
    fn test_yield_zero_rate() {
        assert_eq!(calculate_yield(1_000_000_000, 0, 0, 86400), 0);
    }
}
