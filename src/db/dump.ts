import { db } from "./client";
import type { Goal, Intention, Note, Task } from "./schema";

export interface DatabaseDump {
  notes: Note[];
  tasks: Task[];
  intentions: Intention[];
  goals: Goal[];
  schema_version: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const [notes, tasks, intentions, goals] = await Promise.all([
    db.selectFrom("notes").selectAll().execute(),
    db.selectFrom("tasks").selectAll().execute(),
    db.selectFrom("intentions").selectAll().execute(),
    db.selectFrom("goals").selectAll().execute(),
  ]);

  return {
    notes,
    tasks,
    intentions,
    goals,
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

      if (!localNote) {
        await trx.insertInto("notes").values(remoteNote).execute();
        continue;
      }

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

      if (!localTask) {
        await trx.insertInto("tasks").values(remoteTask).execute();
        continue;
      }

      if (remoteTask.updated_at > localTask.updated_at) {
        await trx.updateTable("tasks").set(remoteTask).where("id", "=", remoteTask.id).execute();
      }
    }

    // Merge intentions
    for (const remoteIntention of dump.intentions ?? []) {
      const localIntention = await trx
        .selectFrom("intentions")
        .selectAll()
        .where("id", "=", remoteIntention.id)
        .executeTakeFirst();

      if (!localIntention) {
        await trx.insertInto("intentions").values(remoteIntention).execute();
        continue;
      }

      if (remoteIntention.updated_at > localIntention.updated_at) {
        await trx
          .updateTable("intentions")
          .set(remoteIntention)
          .where("id", "=", remoteIntention.id)
          .execute();
      }
    }

    // Merge goals
    for (const remoteGoal of dump.goals ?? []) {
      const localGoal = await trx
        .selectFrom("goals")
        .selectAll()
        .where("id", "=", remoteGoal.id)
        .executeTakeFirst();

      if (!localGoal) {
        await trx.insertInto("goals").values(remoteGoal).execute();
        continue;
      }

      if (remoteGoal.updated_at > localGoal.updated_at) {
        await trx.updateTable("goals").set(remoteGoal).where("id", "=", remoteGoal.id).execute();
      }
    }
  });
}
