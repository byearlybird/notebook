import { createFileRoute } from "@tanstack/react-router";
import { useReactiveQuery } from "sqlocal/react";
import { useAuth } from "@clerk/react";
import { useState, useEffect, useRef } from "react";
import { db, sqlocal } from "../db/client";
import { fullSync } from "../sync";
import { isVaultUnlocked, lockVault, tryRestoreFromCache } from "../vault";
import { VaultPrompt } from "../components/VaultPrompt";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { isSignedIn } = useAuth();
  const [vaultUnlocked, setVaultUnlocked] = useState(isVaultUnlocked());
  const [showVaultPrompt, setShowVaultPrompt] = useState(false);
  const vaultButtonRef = useRef<HTMLButtonElement>(null);

  // On mount (or sign-in), try to restore the DEK from IndexedDB silently
  useEffect(() => {
    if (!isSignedIn) return;
    if (vaultUnlocked) return;
    tryRestoreFromCache().then((restored) => {
      if (restored) setVaultUnlocked(true);
    });
  }, [isSignedIn, vaultUnlocked]);

  const { data: notes } = useReactiveQuery(
    sqlocal,
    db
      .selectFrom("notes")
      .select(["id", "content", "created_at"])
      .where("is_deleted", "=", 0)
      .orderBy("created_at", "desc")
      .compile(),
  );

  async function logSyncChanges() {
    const rows = await db.selectFrom("sync_changes").selectAll().execute();
    console.log("sync_changes", rows);
  }

  async function addNote() {
    const content = window.prompt("Enter note:");
    if (!content) return;
    await db
      .insertInto("notes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .values({ id: crypto.randomUUID(), content, created_at: new Date().toISOString() } as any)
      .execute();
  }

  async function editNote(id: string, current: string) {
    const content = window.prompt("Edit note:", current);
    if (!content || content === current) return;
    await db
      .updateTable("notes")
      .set({ content, edited_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();
  }

  async function handleLockVault() {
    await lockVault();
    setVaultUnlocked(false);
    setShowVaultPrompt(false);
  }

  const syncEnabled = isSignedIn && vaultUnlocked;
  const syncTitle = !isSignedIn
    ? "Sign in to enable sync"
    : !vaultUnlocked
      ? "Enter your vault password to enable sync"
      : undefined;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Notes</h1>
      <div className="mt-4 flex flex-wrap items-start gap-2">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={addNote}
        >
          Add Note
        </button>
        <button
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          onClick={logSyncChanges}
        >
          Log sync_changes
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fullSync}
          disabled={!syncEnabled}
          title={syncTitle}
        >
          Sync
        </button>

        {isSignedIn && !vaultUnlocked && (
          <div className="relative">
            <button
              ref={vaultButtonRef}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => setShowVaultPrompt((v) => !v)}
            >
              🔒 Unlock Vault
            </button>
            {showVaultPrompt && (
              <div className="absolute left-0 top-full z-10 mt-1">
                <VaultPrompt
                  onUnlocked={() => {
                    setVaultUnlocked(true);
                    setShowVaultPrompt(false);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {isSignedIn && vaultUnlocked && (
          <button
            className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            onClick={handleLockVault}
          >
            🔓 Lock Vault
          </button>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {notes?.map((note) => (
          <li key={note.id} className="flex items-center justify-between rounded border p-3">
            <span>{note.content}</span>
            <button
              className="ml-4 text-sm text-gray-500 hover:text-gray-800"
              onClick={() => editNote(note.id, note.content)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
