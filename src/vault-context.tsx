import { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { KeyTransport } from "./transport";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "./api";
import { useVaultMachine } from "./hooks/use-vault-machine";
import type { UseVaultMachineResult } from "./hooks/use-vault-machine";
import type { VaultState } from "./syncronization/vault-machine";
import { createLocalKeyPersister } from "./syncronization/local-key-persister";
import type { RemoteKeyPersister } from "./syncronization/remote-key-persister";

const IDLE_STATE: VaultState = { type: "idle" };
const NOOP = () => { };

type VaultContextValue = Pick<
    UseVaultMachineResult,
    "state" | "dek" | "isUnlocked" | "isLoading" | "lock" | "unlock" | "createKey" | "retryLoad"
>;

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({
    keyTransport,
    children,
}: {
    keyTransport: KeyTransport;
    children: ReactNode;
}) {
    const { isSignedIn, getToken } = useAuth();

    // Keep the API client's auth token in sync with Clerk
    useEffect(() => {
        setAuthTokenGetter(getToken);
    }, [getToken]);

    return isSignedIn ? (
        <AuthenticatedVaultProvider keyTransport={keyTransport}>
            {children}
        </AuthenticatedVaultProvider>
    ) : (
        <VaultContext.Provider
            value={{
                state: IDLE_STATE,
                dek: null,
                isUnlocked: false,
                isLoading: false,
                lock: NOOP,
                unlock: NOOP,
                createKey: NOOP,
                retryLoad: NOOP,
            }}
        >
            {children}
        </VaultContext.Provider>
    );
}

function AuthenticatedVaultProvider({
    keyTransport,
    children,
}: {
    keyTransport: KeyTransport;
    children: ReactNode;
}) {
    const localKeysRef = useRef(createLocalKeyPersister());
    const remoteKeysRef = useRef<RemoteKeyPersister>({
        loadKey: () => keyTransport.getWrappedKey(),
        saveKey: (key) => keyTransport.setWrappedKey(key),
        replaceKey: (key) => keyTransport.changeWrappedKey(key),
    });

    const { state, dek, isUnlocked, isLoading, lock, unlock, createKey, retryLoad } =
        useVaultMachine(localKeysRef.current, remoteKeysRef.current);

    return (
        <VaultContext.Provider value={{ state, dek, isUnlocked, isLoading, lock, unlock, createKey, retryLoad }}>
            {children}
        </VaultContext.Provider>
    );
}

export function useVault(): VaultContextValue {
    const ctx = useContext(VaultContext);
    if (!ctx) throw new Error("useVault must be used within VaultProvider");
    return ctx;
}
