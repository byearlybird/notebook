import { createContext, useCallback, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { ChangeTransport } from "./transport";
import { fullSync } from "./sync";
import { useDB, useQuery } from "./db/context";
import { useVault } from "./vault-context";

const POLL_INTERVAL_MS = 30_000;

type SyncContextValue = {
  sync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({
  changeTransport,
  children,
}: {
  changeTransport: ChangeTransport;
  children: ReactNode;
}) {
  const { dek } = useVault();
  const db = useDB();
  const changes = useQuery(db.selectFrom("sync_changes").selectAll());

  const sync = useCallback(() => fullSync(dek, changeTransport), [dek, changeTransport]);

  // Push local changes as they appear
  useEffect(() => {
    if (!dek) return;
    if (changes && changes.length > 0) fullSync(dek, changeTransport);
  }, [changes, dek, changeTransport]);

  // Poll for remote changes
  useEffect(() => {
    if (!dek) return;
    fullSync(dek, changeTransport);
    const id = setInterval(() => fullSync(dek, changeTransport), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [dek, changeTransport]);

  return (
    <SyncContext.Provider value={{ sync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
