import type { DispatchResult, Listener, Machine, TransitionFn } from "../machine";
import type { RemoteKeyPersister } from "./remote-key-persister";
import type { WrappedKey } from "../transport";

type VaultState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "absent" }
  | { type: "saving"; key: WrappedKey }
  | { type: "present"; key: WrappedKey }
  | { type: "replacing"; currentKey: WrappedKey; nextKey: WrappedKey }
  | { type: "error" };

type PublicVaultEvent =
  | { type: "load" }
  | { type: "save"; key: WrappedKey }
  | { type: "replace"; key: WrappedKey };

type InternalVaultEvent =
  | { type: "loaded-present"; key: WrappedKey }
  | { type: "loaded-absent" }
  | { type: "load-failed" }
  | { type: "save-succeeded"; key: WrappedKey }
  | { type: "save-failed" }
  | { type: "replace-succeeded"; key: WrappedKey }
  | { type: "replace-failed" };

type VaultEvent = PublicVaultEvent | InternalVaultEvent;

type VaultCommand =
  | { type: "load-key" }
  | { type: "save-key"; key: WrappedKey }
  | { type: "replace-key"; currentKey: WrappedKey; nextKey: WrappedKey };

type RemoteVaultListener = Listener<VaultState>;

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
        case "loaded-present":
          return { accepted: true, state: { type: "present", key: event.key } };
        case "loaded-absent":
          return { accepted: true, state: { type: "absent" } };
        case "load-failed":
          return { accepted: true, state: { type: "error" } };
        default:
          return { accepted: false };
      }
    case "absent":
      switch (event.type) {
        case "save":
          return {
            accepted: true,
            state: { type: "saving", key: event.key },
            command: { type: "save-key", key: event.key },
          };
        default:
          return { accepted: false };
      }
    case "saving":
      switch (event.type) {
        case "save-succeeded":
          return { accepted: true, state: { type: "present", key: event.key } };
        case "save-failed":
          return { accepted: true, state: { type: "absent" } };
        default:
          return { accepted: false };
      }
    case "present":
      switch (event.type) {
        case "replace":
          return {
            accepted: true,
            state: { type: "replacing", currentKey: state.key, nextKey: event.key },
            command: { type: "replace-key", currentKey: state.key, nextKey: event.key },
          };
        default:
          return { accepted: false };
      }
    case "replacing":
      switch (event.type) {
        case "replace-succeeded":
          return { accepted: true, state: { type: "present", key: event.key } };
        case "replace-failed":
          return { accepted: true, state: { type: "present", key: state.currentKey } };
        default:
          return { accepted: false };
      }
    case "error":
      switch (event.type) {
        case "load":
          return { accepted: true, state: { type: "loading" }, command: { type: "load-key" } };
        default:
          return { accepted: false };
      }
  }
};

export function createRemoteVaultMachine(
  persister: RemoteKeyPersister,
): Machine<VaultState, PublicVaultEvent> {
  let state: VaultState = { type: "idle" };
  const listeners = new Set<RemoteVaultListener>();

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
      case "load-key":
        try {
          const key = await persister.loadKey();
          send(key !== null ? { type: "loaded-present", key } : { type: "loaded-absent" });
        } catch {
          send({ type: "load-failed" });
        }
        break;
      case "save-key":
        try {
          await persister.saveKey(command.key);
          send({ type: "save-succeeded", key: command.key });
        } catch {
          send({ type: "save-failed" });
        }
        break;
      case "replace-key":
        try {
          await persister.replaceKey(command.nextKey);
          send({ type: "replace-succeeded", key: command.nextKey });
        } catch {
          send({ type: "replace-failed" });
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

    subscribe(listener: RemoteVaultListener): () => void {
      listeners.add(listener);

      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
