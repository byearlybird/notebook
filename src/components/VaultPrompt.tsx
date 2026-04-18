import React, { useEffect, useRef, useState } from "react";
import { useVault } from "../vault-context";

type Props = {
  onUnlocked: () => void;
};

export function VaultPrompt({ onUnlocked }: Props) {
  const { state: vaultState, unlock, createKey, retryLoad } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Close the prompt when the vault becomes unlocked
  useEffect(() => {
    if (vaultState.type === "unlocked") {
      onUnlocked();
    }
  }, [vaultState.type, onUnlocked]);

  // Focus the input when the form becomes interactive
  useEffect(() => {
    if (vaultState.type === "no-key" || vaultState.type === "wrapped-key") {
      inputRef.current?.focus();
    }
  }, [vaultState.type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (vaultState.type === "no-key") {
      createKey(passphrase);
    } else if (vaultState.type === "wrapped-key") {
      unlock(passphrase);
    }
  }

  // Treat initial/loading/locking states as not-ready
  if (
    vaultState.type === "idle" ||
    vaultState.type === "loading-key" ||
    vaultState.type === "unlocked" ||
    vaultState.type === "locking"
  ) {
    return null;
  }

  // Load error: show a retry option
  if (vaultState.type === "error") {
    return (
      <div className="flex w-64 flex-col gap-3 border bg-white p-4 shadow-md">
        <p className="text-sm font-semibold">Failed to load vault</p>
        <p className="text-xs text-red-600">{vaultState.error.message}</p>
        <button
          className="bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          onClick={retryLoad}
        >
          Retry
        </button>
      </div>
    );
  }

  const isCreate = vaultState.type === "no-key";
  const isPending = vaultState.type === "creating-key" || vaultState.type === "decrypting-key";
  const error = vaultState.type === "wrapped-key" ? vaultState.error?.message : null;

  const title = isCreate ? "Create vault password" : "Enter vault password";
  const description = isCreate
    ? "Your todos are encrypted before syncing. Choose a vault password to protect them."
    : "Enter your vault password to enable sync.";
  const submitLabel = isCreate ? "Create" : "Unlock";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-64 flex-col gap-3 border bg-white p-4 shadow-md"
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      </div>
      <input
        ref={inputRef}
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Vault password"
        autoComplete={isCreate ? "new-password" : "current-password"}
        required
        className="border px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending || passphrase.length === 0}
        className="bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "…" : submitLabel}
      </button>
    </form>
  );
}
