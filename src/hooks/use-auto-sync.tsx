import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { $syncState, clearAuth, setAuth, sync } from "@/stores/sync-client";
import { useDBQuery } from "./use-db-query";
import { useNetworkStatus } from "./use-network-status";
import { useStore } from "@nanostores/react";

const SYNC_INTERVAL_MS = 60_000;

export function useAutoSync() {
  useSyncAuthStatus();
  const changes = useDBQuery((db) => db.selectFrom("sync_changes").selectAll());

  const client = useStore($syncState);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (client.status !== "unlocked" || !isOnline) {
      return;
    }

    sync();
  }, [changes, client.status, isOnline]);

  useEffect(() => {
    if (client.status !== "unlocked" || !isOnline) {
      return;
    }

    const id = setInterval(() => {
      sync();
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(id);
  }, [client.status, isOnline]);
}

function useSyncAuthStatus() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn === true) {
      setAuth(getToken);
    } else if (isSignedIn === false) {
      clearAuth();
    }
  }, [isSignedIn, getToken]);

  return {};
}
