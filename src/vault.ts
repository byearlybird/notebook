import { api } from "./api";
import {
  cacheDEK,
  clearCachedDEK,
  deriveKEK,
  generateRawDEK,
  generateSalt,
  getCachedDEK,
  importDEK,
  unwrapDEK,
  wrapDEK,
} from "./crypto";

let currentDEK: CryptoKey | null = null;

export function isVaultUnlocked(): boolean {
  return currentDEK !== null;
}

export function getDEK(): CryptoKey {
  if (!currentDEK) throw new Error("Vault is locked");
  return currentDEK;
}

/**
 * First-time vault setup. Generates a fresh DEK, wraps it with a PBKDF2-derived
 * KEK from the given password, uploads the wrapped key to the server, then caches
 * the non-extractable DEK in IndexedDB.
 *
 * Throws if a wrapped key already exists on the server (use changePassword instead).
 */
export async function setupVault(password: string): Promise<void> {
  const salt = generateSalt();
  const kek = await deriveKEK(password, salt);

  const { raw } = await generateRawDEK();
  const { wrappedKey, iv } = await wrapDEK(raw, kek);

  await api.setWrappedKey({
    wrappedKey,
    salt: toBase64(salt),
    iv,
  });

  // Reimport as non-extractable for in-memory use
  const dek = await importDEK(raw);
  await cacheDEK(dek);
  currentDEK = dek;
}

/**
 * Unlock an existing vault. Fetches the wrapped key from the server, derives the
 * KEK from the given password, and unwraps the DEK.
 *
 * Throws if no key exists on the server, or if the password is wrong (AES-GCM
 * authentication tag mismatch).
 */
export async function unlockVault(password: string): Promise<void> {
  const stored = await api.getWrappedKey({});
  if (!stored) throw new Error("No vault key found — set up your vault first");

  const salt = fromBase64(stored.salt);
  const kek = await deriveKEK(password, salt);

  // Throws DOMException on wrong password
  const dek = await unwrapDEK(stored.wrappedKey, stored.iv, kek);

  await cacheDEK(dek);
  currentDEK = dek;
}

/**
 * Attempt to restore the DEK from IndexedDB without prompting for a password.
 * Returns true if successful, false if nothing was cached.
 */
export async function tryRestoreFromCache(): Promise<boolean> {
  const dek = await getCachedDEK();
  if (!dek) return false;
  currentDEK = dek;
  return true;
}

/** Lock the vault: clear the DEK from memory and IndexedDB. */
export async function lockVault(): Promise<void> {
  currentDEK = null;
  await clearCachedDEK();
}

/**
 * Re-wrap the existing DEK under a new password.
 * Verifies the current password is correct before making any changes.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const stored = await api.getWrappedKey({});
  if (!stored) throw new Error("No vault key found");

  const oldSalt = fromBase64(stored.salt);
  const oldKek = await deriveKEK(currentPassword, oldSalt);

  // This throws on wrong current password
  const rawDek = await unwrapRawDEK(stored.wrappedKey, stored.iv, oldKek);

  const newSalt = generateSalt();
  const newKek = await deriveKEK(newPassword, newSalt);
  const { wrappedKey, iv } = await wrapDEK(rawDek, newKek);

  await api.changeWrappedKey({
    wrappedKey,
    salt: toBase64(newSalt),
    iv,
  });
}

// ── Internal helpers ───────────────────────────────────────────────────────

function toBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

/**
 * Like unwrapDEK but returns the raw ArrayBuffer instead of a CryptoKey.
 * Used only during changePassword so we can re-wrap with a new KEK.
 */
async function unwrapRawDEK(wrappedKey: string, iv: string, kek: CryptoKey): Promise<ArrayBuffer> {
  // We need an extractable-capable kek to use subtle.decrypt directly
  const ivBytes = fromBase64(iv);
  const ciphertext = fromBase64(wrappedKey);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, kek, ciphertext);
}
