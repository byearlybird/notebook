import type { Database } from "@/db/schema";
import { toEntry, type Entry } from "@/models";
import type { Kysely } from "kysely";

export function createEntryService(db: Kysely<Database>) {
  return {
    async getToday(): Promise<Entry[]> {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      const entries = await db
        .selectFrom("entries")
        .selectAll()
        .where("date", "=", today)
        .orderBy("createdAt", "desc")
        .execute();

      return entries.map(toEntry);
    },

    async getGroupedByDate(): Promise<Record<string, Entry[]>> {
      const entries = await db
        .selectFrom("entries")
        .selectAll()
        .orderBy("createdAt", "desc")
        .execute();

      const entriesByDate: Record<string, Entry[]> = {};

      for (const entry of entries) {
        entriesByDate[entry.date] ??= [];
        entriesByDate[entry.date].push(toEntry(entry));
      }

      return entriesByDate;
    },
  };
}
