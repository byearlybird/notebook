import { get, set } from "idb-keyval";

export type LocalKeyPersister = {
  saveKey(key: CryptoKey): Promise<void>;
  loadKey(): Promise<CryptoKey | null>;
  clearKey(): Promise<void>;
};

export function createLocalKeyPersister(): LocalKeyPersister {
  const KEY_NAME = "dek";

  return {
    async saveKey(key: CryptoKey) {
      await set(KEY_NAME, key);
    },

    async loadKey(): Promise<CryptoKey | null> {
      const key = await get<CryptoKey>(KEY_NAME);
      return key || null;
    },

    async clearKey() {
      await set(KEY_NAME, null);
    },
  };
}
