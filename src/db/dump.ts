import { db } from "./client";
import type { Note, Task } from "./schema";

export interface DatabaseDump {
  notes: Note[];
  tasks: Task[];
  schema_version: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const [notes, tasks] = await Promise.all([
    db.selectFrom("notes").selectAll().execute(),
    db.selectFrom("tasks").selectAll().execute(),
  ]);

  return {
    notes,
    tasks,
    schema_version: 1,
  };
}

/**
 * Merges a database dump into the local database using last-write-wins conflict resolution.
 * Compares updated_at timestamps to determine which version to keep.
 * Uses a transaction to ensure atomicity - if any part fails, all changes are rolled back.
 */
export async function mergeIntoDatabase(dump: DatabaseDump): Promise<void> {
  if (dump.schema_version !== 1) {
    throw new Error(`Unsupported schema version: ${dump.schema_version}`);
  }

  await db.transaction().execute(async (trx) => {
    // Merge notes
    for (const remoteNote of dump.notes) {
      const localNote = await trx
        .selectFrom("notes")
        .selectAll()
        .where("id", "=", remoteNote.id)
        .executeTakeFirst();

      // Insert if doesn't exist locally
      if (!localNote) {
        await trx.insertInto("notes").values(remoteNote).execute();
        continue;
      }

      // Last-write-wins: keep the version with the latest updated_at
      if (remoteNote.updated_at > localNote.updated_at) {
        await trx.updateTable("notes").set(remoteNote).where("id", "=", remoteNote.id).execute();
      }
    }

    // Merge tasks
    for (const remoteTask of dump.tasks) {
      const localTask = await trx
        .selectFrom("tasks")
        .selectAll()
        .where("id", "=", remoteTask.id)
        .executeTakeFirst();

      // Insert if doesn't exist locally
      if (!localTask) {
        await trx.insertInto("tasks").values(remoteTask).execute();
        continue;
      }

      // Last-write-wins: keep the version with the latest updated_at
      if (remoteTask.updated_at > localTask.updated_at) {
        await trx.updateTable("tasks").set(remoteTask).where("id", "=", remoteTask.id).execute();
      }
    }
  });
}
