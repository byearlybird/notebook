import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { lockVault, setupVault, tryRestoreFromCache, unlockVault } from "./vault";
import type { ChangeTransport, KeyTransport } from "./transport";
import { fullSync } from "./sync";
import { useDB, useQuery } from "./db/context";
import { useClerk } from "@clerk/react";

const POLL_INTERVAL_MS = 30_000;

type SyncState = {
  dek: CryptoKey | null;
  isUnlocked: boolean;
  setup: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => Promise<void>;
  tryRestore: () => Promise<boolean>;
  checkVaultExists: () => Promise<boolean>;
  sync: () => Promise<void>;
};

const SyncContext = createContext<SyncState | null>(null);

export function SyncProvider({
  keyTransport,
  changeTransport,
  children,
}: {
  keyTransport: KeyTransport;
  changeTransport: ChangeTransport;
  children: ReactNode;
}) {
  const [dek, setDek] = useState<CryptoKey | null>(null);
  const { isSignedIn } = useClerk();
  const db = useDB();
  const changes = useQuery(db.selectFrom("sync_changes").selectAll());

  const setup = useCallback(
    async (password: string) => {
      setDek(await setupVault(password, keyTransport));
    },
    [keyTransport],
  );

  const unlock = useCallback(
    async (password: string) => {
      setDek(await unlockVault(password, keyTransport));
    },
    [keyTransport],
  );

  const lock = useCallback(async () => {
    await lockVault();
    setDek(null);
  }, []);

  const tryRestore = useCallback(async () => {
    const restoredDek = await tryRestoreFromCache();
    if (restoredDek) setDek(restoredDek);
    return restoredDek !== null;
  }, []);

  const checkVaultExists = useCallback(
    () => keyTransport.getWrappedKey().then((k) => k !== null),
    [keyTransport],
  );

  const sync = useCallback(() => fullSync(dek, changeTransport), [dek, changeTransport]);

  // Push local changes as they appear
  useEffect(() => {
    if (!isSignedIn) return;
    if (changes && changes.length > 0) fullSync(dek, changeTransport);
  }, [changes, isSignedIn, dek, changeTransport]);

  // Poll for remote changes
  useEffect(() => {
    if (!isSignedIn) return;
    fullSync(dek, changeTransport);
    const id = setInterval(() => fullSync(dek, changeTransport), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isSignedIn, dek, changeTransport]);

  return (
    <SyncContext.Provider
      value={{
        dek,
        isUnlocked: dek !== null,
        setup,
        unlock,
        lock,
        tryRestore,
        checkVaultExists,
        sync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncState {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
