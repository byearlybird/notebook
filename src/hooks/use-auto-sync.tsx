import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { $syncState, clearAuth, setAuth, sync } from "../stores/sync-client";
import { useDB, useQuery } from "../db/context";
import { useStore } from "@nanostores/react";

export function useAutoSync() {
  useSyncAuthStatus();
  const changes = useDBChanges();
  const client = useStore($syncState);

  useEffect(() => {
    if (client.status !== "unlocked") {
      return;
    }

    sync();
  }, [changes, client.status]);
}

function useSyncAuthStatus() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuth(getToken);
    } else {
      clearAuth();
    }
  }, [isSignedIn, getToken]);

  return {};
}

function useDBChanges() {
  const db = useDB();
  const changes = useQuery(db.selectFrom("sync_changes").selectAll());

  return changes;
}
