import { createFileRoute } from "@tanstack/react-router";
import { useReactiveQuery } from "sqlocal/react";
import { db, sqlocal } from "../db/client";
import { fullSync } from "../sync";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Notes</h1>
      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={addNote}
      >
        Add Note
      </button>
      <button
        className="mt-4 ml-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        onClick={logSyncChanges}
      >
        Log sync_changes
      </button>
      <button
        className="mt-4 ml-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        onClick={fullSync}
      >
        Sync
      </button>
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
