import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { setupVault, unlockVault } from "../vault";

type Mode = "loading" | "create" | "unlock";

type Props = {
    onUnlocked: () => void;
};

export function VaultPrompt({ onUnlocked }: Props) {
    const [mode, setMode] = useState<Mode>("loading");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.getWrappedKey({}).then((result) => {
            setMode(result === null ? "create" : "unlock");
        });
    }, []);

    useEffect(() => {
        if (mode !== "loading") {
            inputRef.current?.focus();
        }
    }, [mode]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
            if (mode === "create") {
                await setupVault(password);
            } else {
                await unlockVault(password);
            }
            setPassword("");
            onUnlocked();
        } catch (err) {
            if (mode === "unlock") {
                setError("Incorrect password. Please try again.");
            } else {
                setError(err instanceof Error ? err.message : "Failed to set up vault.");
            }
        } finally {
            setPending(false);
        }
    }

    if (mode === "loading") return null;

    const title = mode === "create" ? "Create vault password" : "Enter vault password";
    const description =
        mode === "create"
            ? "Your notes are encrypted before syncing. Choose a vault password to protect them."
            : "Enter your vault password to enable sync.";
    const submitLabel = mode === "create" ? "Create" : "Unlock";

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-72 flex-col gap-3 rounded-lg border bg-white p-4 shadow-lg"
        >
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            </div>
            <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vault password"
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                required
                className="rounded border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={pending || password.length === 0}
                className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "…" : submitLabel}
            </button>
        </form>
    );
}
