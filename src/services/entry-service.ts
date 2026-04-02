import type { Database } from "@/db/schema";
import { toEntry, type Entry } from "@/models";
import type { Kysely } from "kysely";
import { fetchLabelMap } from "./label-helpers";

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

      const labelMap = await fetchLabelMap(
        db,
        entries.map((e) => e.labelId),
      );
      return entries.map((e) => toEntry(e, e.labelId ? (labelMap.get(e.labelId) ?? null) : null));
    },

    async getGroupedByDate(): Promise<Record<string, Entry[]>> {
      const entries = await db
        .selectFrom("entries")
        .selectAll()
        .orderBy("createdAt", "desc")
        .execute();

      const labelMap = await fetchLabelMap(
        db,
        entries.map((e) => e.labelId),
      );

      const entriesByDate: Record<string, Entry[]> = {};

      for (const entry of entries) {
        entriesByDate[entry.date] ??= [];
        entriesByDate[entry.date].push(
          toEntry(entry, entry.labelId ? (labelMap.get(entry.labelId) ?? null) : null),
        );
      }

      return entriesByDate;
    },

    async search(query: string, limit = 10): Promise<Entry[]> {
      const entries = await db
        .selectFrom("entries")
        .innerJoin("entrySearchMeta", "entrySearchMeta.entryId", "entries.id")
        .selectAll("entries")
        .where("entrySearchMeta.plainText", "like", `%${query}%`)
        .orderBy("entries.createdAt", "desc")
        .limit(limit)
        .execute();

      const labelMap = await fetchLabelMap(
        db,
        entries.map((e) => e.labelId),
      );
      return entries.map((e) => toEntry(e, e.labelId ? (labelMap.get(e.labelId) ?? null) : null));
    },
  };
}
