import type { TransitionFn, Listener, Machine } from "../machine";
import type { LocalKeyPersister } from "./local-key-persister";
import type { RemoteKeyPersister } from "./remote-key-persister";
import type { WrappedKey } from "../transport";
import {
  generateRawDEK,
  generateSalt,
  toBase64,
  deriveKEK,
  wrapDEK,
  unwrapDEK,
  fromBase64,
} from "../crypto";

export type VaultState =
  | { type: "idle" }
  | {
      type: "error";
      error: Error;
    }
  | { type: "loading-key" }
  | { type: "no-key" }
  | {
      type: "wrapped-key";
      wrappedKey: WrappedKey;
      error?: Error;
    }
  | { type: "creating-key" }
  | {
      type: "decrypting-key";
      wrappedKey: WrappedKey;
    }
  | {
      type: "unlocked";
      dek: CryptoKey;
    }
  | {
      type: "locking";
      dek: CryptoKey;
    };

export type PublicVaultEvent =
  | { type: "load-key" }
  | { type: "decrypt-key"; passphrase: string }
  | { type: "create-key"; passphrase: string }
  | { type: "lock" };

type InternalVaultEvent =
  | { type: "loaded-cached-key"; dek: CryptoKey }
  | { type: "loaded-remote-key"; wrappedKey: WrappedKey }
  | { type: "loaded-no-key-found" }
  | { type: "loaded-failed"; error: Error }
  | { type: "decrypted-success"; dek: CryptoKey }
  | { type: "decrypted-failed"; error: Error }
  | { type: "created-key"; dek: CryptoKey }
  | { type: "create-key-failed"; error: Error }
  | { type: "lock-succeeded" }
  | { type: "lock-failed" };

type VaultEvent = PublicVaultEvent | InternalVaultEvent;

type VaultCommand =
  | { type: "load-key" }
  | { type: "create-key"; passphrase: string }
  | { type: "decrypt-key"; passphrase: string; wrappedKey: WrappedKey }
  | { type: "clear-key" };

export const transition: TransitionFn<VaultState, VaultEvent, VaultCommand> = (state, event) => {
  switch (state.type) {
    case "idle":
      switch (event.type) {
        case "load-key":
          return { accepted: true, state: { type: "loading-key" }, command: { type: "load-key" } };
        default:
          return { accepted: false };
      }
    case "error":
      switch (event.type) {
        case "load-key":
          return { accepted: true, state: { type: "loading-key" }, command: { type: "load-key" } };
        default:
          return { accepted: false };
      }
    case "loading-key":
      switch (event.type) {
        case "loaded-cached-key":
          return { accepted: true, state: { type: "unlocked", dek: event.dek } };
        case "loaded-remote-key":
          return {
            accepted: true,
            state: { type: "wrapped-key", wrappedKey: event.wrappedKey },
          };
        case "loaded-no-key-found":
          return { accepted: true, state: { type: "no-key" } };
        case "loaded-failed":
          return { accepted: true, state: { type: "error", error: event.error } };
        default:
          return { accepted: false };
      }
    case "no-key":
      switch (event.type) {
        case "create-key":
          return {
            accepted: true,
            state: { type: "creating-key" },
            command: { type: "create-key", passphrase: event.passphrase },
          };
        default:
          return { accepted: false };
      }
    case "wrapped-key":
      switch (event.type) {
        case "decrypt-key":
          return {
            accepted: true,
            state: { type: "decrypting-key", wrappedKey: state.wrappedKey },
            command: {
              type: "decrypt-key",
              passphrase: event.passphrase,
              wrappedKey: state.wrappedKey,
            },
          };
        default:
          return { accepted: false };
      }
    case "creating-key":
      switch (event.type) {
        case "created-key":
          return {
            accepted: true,
            state: { type: "unlocked", dek: event.dek },
          };
        case "create-key-failed":
          return {
            accepted: true,
            state: { type: "error", error: event.error },
          };
        default:
          return { accepted: false };
      }
    case "decrypting-key":
      switch (event.type) {
        case "decrypted-failed":
          return {
            accepted: true,
            state: { type: "wrapped-key", wrappedKey: state.wrappedKey, error: event.error },
          };
        case "decrypted-success":
          return {
            accepted: true,
            state: { type: "unlocked", dek: event.dek },
          };
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
    case "locking":
      switch (event.type) {
        case "lock-succeeded":
          return {
            accepted: true,
            state: { type: "loading-key" },
            command: { type: "load-key" },
          };
        case "lock-failed":
          return { accepted: true, state: { type: "unlocked", dek: state.dek } };
        default:
          return { accepted: false };
      }
  }
};

export function createVaultMachine(
  localKeys: LocalKeyPersister,
  remoteKeys: RemoteKeyPersister,
): Machine<VaultState, PublicVaultEvent> {
  let state: VaultState = { type: "idle" };
  const listeners = new Set<Listener<VaultState>>();

  function emit(): void {
    const snapshot = state;
    for (const listener of [...listeners]) {
      listener(snapshot);
    }
  }

  function send(event: VaultEvent): boolean {
    const result = transition(state, event);
    if (!result.accepted) return false;
    state = result.state;
    emit();
    if (result.command) {
      void runCommand(result.command);
    }
    return true;
  }

  async function runCommand(command: VaultCommand): Promise<void> {
    switch (command.type) {
      case "load-key": {
        try {
          const cached = await localKeys.loadKey();
          if (cached) {
            send({ type: "loaded-cached-key", dek: cached });
            return;
          }
          const remote = await remoteKeys.loadKey();
          if (remote) {
            send({ type: "loaded-remote-key", wrappedKey: remote });
            return;
          }
          send({ type: "loaded-no-key-found" });
        } catch (e) {
          send({
            type: "loaded-failed",
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
        break;
      }
      case "create-key": {
        try {
          const salt = generateSalt();
          const kek = await deriveKEK(command.passphrase, salt);
          const { key: dek, raw } = await generateRawDEK();
          const { wrappedKey, iv } = await wrapDEK(raw, kek);
          await remoteKeys.saveKey({ wrappedKey, salt: toBase64(salt), iv });
          await localKeys.saveKey(dek);
          send({ type: "created-key", dek });
        } catch (e) {
          send({
            type: "create-key-failed",
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
        break;
      }
      case "decrypt-key": {
        try {
          const salt = fromBase64(command.wrappedKey.salt);
          const kek = await deriveKEK(command.passphrase, salt);
          const dek = await unwrapDEK(command.wrappedKey.wrappedKey, command.wrappedKey.iv, kek);
          await localKeys.saveKey(dek);
          send({ type: "decrypted-success", dek });
        } catch (e) {
          send({
            type: "decrypted-failed",
            error: e instanceof Error ? e : new Error(String(e)),
          });
        }
        break;
      }
      case "clear-key": {
        try {
          await localKeys.clearKey();
          send({ type: "lock-succeeded" });
        } catch {
          send({ type: "lock-failed" });
        }
        break;
      }
    }
  }

  return {
    dispatch: (event) => ({ accepted: send(event) }),
    get state() {
      return state;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
