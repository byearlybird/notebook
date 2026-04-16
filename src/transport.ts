export type WrappedKey = {
  wrappedKey: string;
  salt: string;
  iv: string;
};

export interface KeyTransport {
  getWrappedKey(): Promise<WrappedKey | null>;
  setWrappedKey(key: WrappedKey): Promise<void>;
  changeWrappedKey(key: WrappedKey): Promise<void>;
}

export interface ChangeTransport {
  pullChanges(since: number): Promise<{ changes: { cyphertext: string }[]; maxSeq: number }>;
  pushChanges(changes: string[]): Promise<void>;
}
