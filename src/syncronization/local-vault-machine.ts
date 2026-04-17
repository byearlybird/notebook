import type { DispatchResult, Listener, Machine, TransitionFn } from "../machine";
import type { LocalKeyPersister } from "./local-key-persister";

type VaultState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "locked" }
  | { type: "unlocking"; dek: CryptoKey }
  | { type: "locking"; dek: CryptoKey }
  | { type: "unlocked"; dek: CryptoKey };

type PublicVaultEvent = { type: "load" } | { type: "unlock"; dek: CryptoKey } | { type: "lock" };

type InternalVaultEvent =
  | { type: "unlock-succeeded"; dek: CryptoKey }
  | { type: "unlock-failed" }
  | { type: "lock-succeeded" }
  | { type: "lock-failed" };

type VaultEvent = PublicVaultEvent | InternalVaultEvent;

type VaultCommand =
  | { type: "save-key"; dek: CryptoKey }
  | { type: "clear-key" }
  | { type: "load-key" };

type LocalVaultListener = Listener<VaultState>;

const transition: TransitionFn<VaultState, VaultEvent, VaultCommand> = (state, event) => {
  switch (state.type) {
    case "idle":
      switch (event.type) {
        case "load":
          return { accepted: true, state: { type: "loading" }, command: { type: "load-key" } };
        default:
          return { accepted: false };
      }
    case "loading":
      switch (event.type) {
        case "lock-succeeded":
          return { accepted: true, state: { type: "locked" } };
        case "unlock-succeeded":
          return { accepted: true, state: { type: "unlocked", dek: event.dek } };
        default:
          return { accepted: false };
      }
    case "locked":
      switch (event.type) {
        case "unlock":
          return {
            accepted: true,
            state: { type: "unlocking", dek: event.dek },
            command: { type: "save-key", dek: event.dek },
          };
        default:
          return { accepted: false };
      }
    case "unlocking":
      switch (event.type) {
        case "unlock-succeeded":
          return { accepted: true, state: { type: "unlocked", dek: event.dek } };
        case "unlock-failed":
          return { accepted: true, state: { type: "locked" } };
        default:
          return { accepted: false };
      }
    case "locking":
      switch (event.type) {
        case "lock-succeeded":
          return { accepted: true, state: { type: "locked" } };
        case "lock-failed":
          return { accepted: true, state: { type: "unlocked", dek: state.dek } };
        default:
          return { accepted: false };
      }
    case "unlocked":
      switch (event.type) {
        case "lock":
          return {
            accepted: true,
            state: { type: "locking", dek: state.dek },
            command: { type: "clear-key" },
          };
        default:
          return { accepted: false };
      }
  }
};

export function createVaultMachine(
  persister: LocalKeyPersister,
): Machine<VaultState, PublicVaultEvent> {
  let state: VaultState = { type: "idle" };
  const listeners = new Set<LocalVaultListener>();

  function emit(): void {
    const snapshot = state;

    for (const listener of [...listeners]) {
      listener(snapshot);
    }
  }

  function send(event: VaultEvent): boolean {
    const result = transition(state, event);

    if (result.accepted === false) {
      return false;
    }

    state = result.state;
    emit();

    if (result.command) {
      void runCommand(result.command);
    }

    return true;
  }

  async function runCommand(command: VaultCommand): Promise<void> {
    switch (command.type) {
      case "save-key":
        try {
          await persister.saveKey(command.dek);
          send({ type: "unlock-succeeded", dek: command.dek });
        } catch {
          send({ type: "unlock-failed" });
        }
        break;
      case "clear-key":
        try {
          await persister.clearKey();
          send({ type: "lock-succeeded" });
        } catch {
          send({ type: "lock-failed" });
        }
        break;
      case "load-key":
        try {
          const dek = await persister.loadKey();
          send(dek !== null ? { type: "unlock-succeeded", dek } : { type: "lock-succeeded" });
        } catch {
          send({ type: "lock-succeeded" });
        }
        break;
    }
  }

  return {
    dispatch(event: PublicVaultEvent): DispatchResult {
      return { accepted: send(event) };
    },

    get state() {
      return state;
    },

    subscribe(listener: LocalVaultListener): () => void {
      listeners.add(listener);

      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
