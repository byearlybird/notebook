import { db } from "./client";
import type { MonthlyGoal, MonthlyLog, Note, Task } from "./schema";

export interface DatabaseDump {
  notes: Note[];
  tasks: Task[];
  monthly_logs: MonthlyLog[];
  monthly_goals: MonthlyGoal[];
  schema_version: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const [notes, tasks, monthly_logs, monthly_goals] = await Promise.all([
    db.selectFrom("notes").selectAll().execute(),
    db.selectFrom("tasks").selectAll().execute(),
    db.selectFrom("monthly_logs").selectAll().execute(),
    db.selectFrom("monthly_goals").selectAll().execute(),
  ]);

  return {
    notes,
    tasks,
    monthly_logs,
    monthly_goals,
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

    // Merge monthly logs
    for (const remoteLog of dump.monthly_logs) {
      const localLog = await trx
        .selectFrom("monthly_logs")
        .selectAll()
        .where("id", "=", remoteLog.id)
        .executeTakeFirst();

      if (!localLog) {
        await trx.insertInto("monthly_logs").values(remoteLog).execute();
        continue;
      }

      if (remoteLog.updated_at > localLog.updated_at) {
        await trx
          .updateTable("monthly_logs")
          .set(remoteLog)
          .where("id", "=", remoteLog.id)
          .execute();
      }
    }

    // Merge monthly goals
    for (const remoteGoal of dump.monthly_goals) {
      const localGoal = await trx
        .selectFrom("monthly_goals")
        .selectAll()
        .where("id", "=", remoteGoal.id)
        .executeTakeFirst();

      if (!localGoal) {
        await trx.insertInto("monthly_goals").values(remoteGoal).execute();
        continue;
      }

      if (remoteGoal.updated_at > localGoal.updated_at) {
        await trx
          .updateTable("monthly_goals")
          .set(remoteGoal)
          .where("id", "=", remoteGoal.id)
          .execute();
      }
    }
  });
}
