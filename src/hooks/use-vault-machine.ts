import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createVaultMachine } from "../syncronization/vault-machine";
import type { VaultState } from "../syncronization/vault-machine";
import type { LocalKeyPersister } from "../syncronization/local-key-persister";
import type { RemoteKeyPersister } from "../syncronization/remote-key-persister";

export type UseVaultMachineResult = {
  state: VaultState;
  dek: CryptoKey | null;
  isUnlocked: boolean;
  isLoading: boolean;
  lock: () => void;
  unlock: (passphrase: string) => void;
  createKey: (passphrase: string) => void;
  retryLoad: () => void;
};

export function useVaultMachine(
  localKeys: LocalKeyPersister,
  remoteKeys: RemoteKeyPersister,
): UseVaultMachineResult {
  const machineRef = useRef<ReturnType<typeof createVaultMachine> | null>(null);
  if (machineRef.current === null) {
    machineRef.current = createVaultMachine(localKeys, remoteKeys);
  }
  const machine = machineRef.current;

  const state = useSyncExternalStore(machine.subscribe, () => machine.state);

  useEffect(() => {
    machine.dispatch({ type: "load-key" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dek = state.type === "unlocked" ? state.dek : null;
  const isUnlocked = state.type === "unlocked";
  const isLoading =
    state.type === "idle" || state.type === "loading-key" || state.type === "locking";

  const lock = useCallback(() => {
    machine.dispatch({ type: "lock" });
  }, [machine]);

  const unlock = useCallback(
    (passphrase: string) => {
      machine.dispatch({ type: "decrypt-key", passphrase });
    },
    [machine],
  );

  const createKey = useCallback(
    (passphrase: string) => {
      machine.dispatch({ type: "create-key", passphrase });
    },
    [machine],
  );

  const retryLoad = useCallback(() => {
    machine.dispatch({ type: "load-key" });
  }, [machine]);

  return { state, dek, isUnlocked, isLoading, lock, unlock, createKey, retryLoad };
}
