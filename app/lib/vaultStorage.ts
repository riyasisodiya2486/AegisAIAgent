/**
 * Persists vault PDA addresses in localStorage keyed by owner pubkey.
 * This ensures the dashboard auto-loads the vault on return visits.
 */

const KEY_PREFIX = "aegis_vault_";

export function saveVaultAddress(ownerPubkey: string, vaultPda: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadAllVaults(ownerPubkey);
    if (!existing.includes(vaultPda)) {
      existing.push(vaultPda);
    }
    localStorage.setItem(KEY_PREFIX + ownerPubkey, JSON.stringify(existing));
  } catch {
    // Fail silently: localStorage might be blocked by browser privacy settings
  }
}

export function loadAllVaults(ownerPubkey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_PREFIX + ownerPubkey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadPrimaryVault(ownerPubkey: string): string | null {
  const vaults = loadAllVaults(ownerPubkey);
  // Returns the most recently added vault as the primary one
  return vaults.length > 0 ? vaults[vaults.length - 1] : null;
}

export function removeVaultAddress(ownerPubkey: string, vaultPda: string): void {
  if (typeof window === "undefined") return;
  try {
    const remaining = loadAllVaults(ownerPubkey).filter((v) => v !== vaultPda);
    localStorage.setItem(KEY_PREFIX + ownerPubkey, JSON.stringify(remaining));
  } catch {}
}