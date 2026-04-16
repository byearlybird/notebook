import {
  cacheDEK,
  clearCachedDEK,
  deriveKEK,
  fromBase64,
  generateRawDEK,
  generateSalt,
  getCachedDEK,
  importDEK,
  toBase64,
  unwrapDEK,
  wrapDEK,
} from "./crypto";
import type { KeyTransport } from "./transport";

/**
 * First-time vault setup. Generates a fresh DEK, wraps it with a PBKDF2-derived
 * KEK from the given password, uploads the wrapped key to the server, then caches
 * the non-extractable DEK in IndexedDB.
 *
 * Returns the unlocked DEK. Throws if a wrapped key already exists on the server.
 */
export async function setupVault(password: string, transport: KeyTransport): Promise<CryptoKey> {
  const salt = generateSalt();
  const kek = await deriveKEK(password, salt);

  const { raw } = await generateRawDEK();
  const { wrappedKey, iv } = await wrapDEK(raw, kek);

  await transport.setWrappedKey({ wrappedKey, salt: toBase64(salt), iv });

  const dek = await importDEK(raw);
  await cacheDEK(dek);
  return dek;
}

/**
 * Unlock an existing vault. Fetches the wrapped key from the server, derives the
 * KEK from the given password, and unwraps the DEK.
 *
 * Returns the unlocked DEK. Throws if no key exists on the server, or if the
 * password is wrong (AES-GCM authentication tag mismatch).
 */
export async function unlockVault(password: string, transport: KeyTransport): Promise<CryptoKey> {
  const stored = await transport.getWrappedKey();
  if (!stored) throw new Error("No vault key found — set up your vault first");

  const salt = fromBase64(stored.salt);
  const kek = await deriveKEK(password, salt);

  const dek = await unwrapDEK(stored.wrappedKey, stored.iv, kek);
  await cacheDEK(dek);
  return dek;
}

/**
 * Attempt to restore the DEK from IndexedDB without prompting for a password.
 * Returns the DEK if successful, null if nothing was cached.
 */
export async function tryRestoreFromCache(): Promise<CryptoKey | null> {
  return getCachedDEK();
}

/** Lock the vault: clear the DEK from IndexedDB. */
export async function lockVault(): Promise<void> {
  await clearCachedDEK();
}

/**
 * Re-wrap the existing DEK under a new password.
 * Verifies the current password is correct before making any changes.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  transport: KeyTransport,
): Promise<void> {
  const stored = await transport.getWrappedKey();
  if (!stored) throw new Error("No vault key found");

  const oldSalt = fromBase64(stored.salt);
  const oldKek = await deriveKEK(currentPassword, oldSalt);

  const rawDek = await unwrapRawDEK(stored.wrappedKey, stored.iv, oldKek);

  const newSalt = generateSalt();
  const newKek = await deriveKEK(newPassword, newSalt);
  const { wrappedKey, iv } = await wrapDEK(rawDek, newKek);

  await transport.changeWrappedKey({ wrappedKey, salt: toBase64(newSalt), iv });
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Like unwrapDEK but returns the raw ArrayBuffer instead of a CryptoKey.
 * Used only during changePassword so we can re-wrap with a new KEK.
 */
async function unwrapRawDEK(wrappedKey: string, iv: string, kek: CryptoKey): Promise<ArrayBuffer> {
  const ivBytes = fromBase64(iv);
  const ciphertext = fromBase64(wrappedKey);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, kek, ciphertext);
}
