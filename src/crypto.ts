const PBKDF2_ITERATIONS = 600_000;
const IDB_DB_NAME = "vault";
const IDB_STORE_NAME = "keys";
const IDB_DEK_KEY = "dek";

// ── Helpers ────────────────────────────────────────────────────────────────

function toBase64(buf: ArrayBuffer | Uint8Array<ArrayBuffer>): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

// ── Salt ───────────────────────────────────────────────────────────────────

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// ── DEK (Data Encryption Key) ──────────────────────────────────────────────

/**
 * Generate a fresh AES-256-GCM DEK.
 * extractable=true only so we can export raw bytes for wrapping;
 * callers must reimport as non-extractable after wrapping.
 */
export async function generateRawDEK(): Promise<{ key: CryptoKey; raw: ArrayBuffer }> {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const raw = await crypto.subtle.exportKey("raw", key);
  return { key, raw };
}

/** Import raw DEK bytes as a non-extractable CryptoKey for use. */
export async function importDEK(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
}

// ── KEK (Key Encryption Key) via PBKDF2 ───────────────────────────────────

export async function deriveKEK(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  // Ensure a concrete ArrayBuffer for the salt (avoids SharedArrayBuffer type incompatibility)
  const saltBuf = salt.buffer instanceof ArrayBuffer ? salt.buffer : salt.slice().buffer;
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuf, iterations: PBKDF2_ITERATIONS },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ── Wrapping / Unwrapping ──────────────────────────────────────────────────

/** Encrypt raw DEK bytes with the KEK. Returns base64 ciphertext + iv. */
export async function wrapDEK(
  rawDek: ArrayBuffer,
  kek: CryptoKey,
): Promise<{ wrappedKey: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, kek, rawDek);
  return { wrappedKey: toBase64(ciphertext), iv: toBase64(iv) };
}

/**
 * Decrypt wrapped DEK bytes with the KEK and reimport as non-extractable.
 * Throws a DOMException if the password / KEK is wrong (authentication tag mismatch).
 */
export async function unwrapDEK(
  wrappedKey: string,
  iv: string,
  kek: CryptoKey,
): Promise<CryptoKey> {
  const rawDek = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    kek,
    fromBase64(wrappedKey),
  );
  return importDEK(rawDek);
}

// ── Encrypt / Decrypt payloads ─────────────────────────────────────────────

/** Encrypt a plaintext string with the DEK. Returns a base64 string: [12-byte IV][ciphertext]. */
export async function encrypt(plaintext: string, dek: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    dek,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return toBase64(combined.buffer);
}

/** Decrypt a base64 payload produced by `encrypt`. */
export async function decrypt(ciphertext: string, dek: CryptoKey): Promise<string> {
  const combined = fromBase64(ciphertext);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, dek, data);
  return new TextDecoder().decode(plain);
}

// ── IndexedDB caching of non-extractable CryptoKey ────────────────────────

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheDEK(dek: CryptoKey): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    tx.objectStore(IDB_STORE_NAME).put(dek, IDB_DEK_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedDEK(): Promise<CryptoKey | null> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, "readonly");
    const req = tx.objectStore(IDB_STORE_NAME).get(IDB_DEK_KEY);
    req.onsuccess = () => resolve((req.result as CryptoKey) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearCachedDEK(): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    tx.objectStore(IDB_STORE_NAME).delete(IDB_DEK_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
