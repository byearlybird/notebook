import { toIntention, type Intention } from "@/models";
import type { EntryRepo } from "@/repos/entry-repo";
import { getTodayISODate } from "@/utils/date-utils";

export function createIntentionService(entryRepo: EntryRepo) {
  return {
    getByMonth: async (month: string): Promise<Intention | undefined> => {
      const result = await entryRepo.getByMonth(month);
      return result ? toIntention(result) : undefined;
    },
    upsert: async (month: string, content: string): Promise<void> => {
      const existing = await entryRepo.getByMonth(month);
      if (existing) {
        await entryRepo.update(existing.id, { content });
      } else {
        await entryRepo.create({
          date: getTodayISODate(),
          content,
          type: "intention",
          status: null,
          originId: null,
          labelId: null,
        });
      }
    },
    get: async (id: string): Promise<Intention | undefined> => {
      const result = await entryRepo.get(id);
      return result ? toIntention(result) : undefined;
    },
    update: async (id: string, updates: { content: string }): Promise<void> => {
      await entryRepo.update(id, updates);
    },
    delete: async (id: string): Promise<void> => {
      await entryRepo.delete(id);
    },
  };
}
