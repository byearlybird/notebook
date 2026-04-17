export type WrappedKey = {
  key: string;
  salt: string;
  iv: string;
};

export type RemoteKeyPersister = {
  saveKey(key: WrappedKey): Promise<void>;
  loadKey(): Promise<WrappedKey | null>;
  replaceKey(key: WrappedKey): Promise<void>;
};
