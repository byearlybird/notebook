import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/button";
import {
  $syncState,
  createKey,
  hasRemoteKey,
  loadRemoteKey,
  lock,
} from "@/stores/sync-client";

export const Route = createFileRoute("/settings/sync")({
  component: RouteComponent,
});

function RouteComponent() {
  const state = useStore($syncState);

  if (state.status === "unauthed") {
    return <Message>Sign in to manage sync.</Message>;
  }
  if (state.status === "loading-key") {
    return <Message>Loading…</Message>;
  }
  if (state.status === "unlocked") {
    return <UnlockedView />;
  }
  return <LockedView />;
}

function UnlockedView() {
  return (
    <Section title="Vault unlocked" description="Your notes sync encrypted across devices.">
      <Button variant="outline" onClick={() => lock()}>
        Lock vault
      </Button>
    </Section>
  );
}

function LockedView() {
  const [remoteState, setRemoteState] = useState<"checking" | "exists" | "missing" | "error">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    hasRemoteKey().then((result) => {
      if (cancelled) return;
      if (result.result === "success") {
        setRemoteState(result.hasKey ? "exists" : "missing");
      } else if (result.result === "error") {
        setRemoteState("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (remoteState === "checking") return <Message>Checking for existing vault…</Message>;
  if (remoteState === "error") return <Message tone="error">Couldn't reach the sync server.</Message>;
  if (remoteState === "missing") return <CreateVaultForm />;
  return <UnlockVaultForm />;
}

function UnlockVaultForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleUnlock() {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    const result = await loadRemoteKey(password);
    setBusy(false);
    if (result.result === "error") {
      setError("Wrong password, or the vault key couldn't be unwrapped.");
    }
  }

  return (
    <Section
      title="Unlock vault"
      description="Enter your vault password to decrypt and sync your notes."
    >
      <PasswordField
        value={password}
        onChange={setPassword}
        onSubmit={handleUnlock}
        placeholder="Vault password"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={handleUnlock} disabled={!password || busy}>
        {busy ? "Unlocking…" : "Unlock"}
      </Button>
    </Section>
  );
}

function CreateVaultForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleCreate() {
    if (!password || password !== confirm || busy) return;
    setBusy(true);
    setError(null);
    const result = await createKey(password);
    setBusy(false);
    if (result.result === "error") {
      setError(result.error.message);
    }
  }

  return (
    <Section
      title="Create vault"
      description="Choose a password to encrypt your notes. The password is never sent to the server — if you lose it, your data can't be recovered."
    >
      <PasswordField
        value={password}
        onChange={setPassword}
        onSubmit={handleCreate}
        placeholder="New password"
      />
      <PasswordField
        value={confirm}
        onChange={setConfirm}
        onSubmit={handleCreate}
        placeholder="Confirm password"
      />
      {mismatch && <p className="text-sm text-red-400">Passwords don't match.</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={handleCreate} disabled={!password || password !== confirm || busy}>
        {busy ? "Creating…" : "Create vault"}
      </Button>
    </Section>
  );
}

function PasswordField({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      placeholder={placeholder}
      className="w-full bg-background outline outline-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-foreground-muted"
    />
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description && <p className="text-sm text-foreground-muted mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Message({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <p className={tone === "error" ? "text-sm text-red-400" : "text-sm text-foreground-muted"}>
      {children}
    </p>
  );
}
