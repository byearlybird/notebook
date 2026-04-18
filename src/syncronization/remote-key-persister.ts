import type { WrappedKey } from "../transport";

export type RemoteKeyPersister = {
  saveKey(key: WrappedKey): Promise<void>;
  loadKey(): Promise<WrappedKey | null>;
  replaceKey(key: WrappedKey): Promise<void>;
};
