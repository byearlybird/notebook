import { toEntries, type Entry } from "@/models";
import type { EntryRepo } from "@/repos/entry-repo";
import type { LabelRepo } from "@/repos/label-repo";

export function createEntryService(entryRepo: EntryRepo, labelRepo: LabelRepo) {
  return {
    async getToday(): Promise<Entry[]> {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      const entries = await entryRepo.getByDate(today);
      const ids = entries.map((e) => e.labelId).filter((id): id is string => id != null);
      return toEntries(entries, await labelRepo.getByIds(ids));
    },

    async getGroupedByDate(): Promise<Record<string, Entry[]>> {
      const entries = await entryRepo.getAll();
      const ids = entries.map((e) => e.labelId).filter((id): id is string => id != null);

      const entriesByDate: Record<string, Entry[]> = {};

      for (const entry of toEntries(entries, await labelRepo.getByIds(ids))) {
        entriesByDate[entry.date] ??= [];
        entriesByDate[entry.date].push(entry);
      }

      return entriesByDate;
    },

    async search(query: string, limit = 10): Promise<Entry[]> {
      const entries = await entryRepo.searchByContent(query, limit);
      const ids = entries.map((e) => e.labelId).filter((id): id is string => id != null);
      return toEntries(entries, await labelRepo.getByIds(ids));
    },
  };
}
