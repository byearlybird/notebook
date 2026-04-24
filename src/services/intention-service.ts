import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const intentionService = {
  async setCurrentMonthIntention(content: string) {
    const month = new Date().toISOString().slice(0, 7);
    return intentionService.createIntention(content, month);
  },
  async createIntention(content: string, month: string) {
    const now = new Date();
    const localISO = toLocalISO(now);

    const existing = await db
      .selectFrom("intentions")
      .select("id")
      .where("month", "=", month)
      .where("is_deleted", "=", 0)
      .executeTakeFirst();

    if (existing) {
      await db
        .updateTable("intentions")
        .set({ content, content_edited_at: localISO })
        .where("id", "=", existing.id)
        .execute();
    } else {
      await db
        .insertInto("intentions")
        .values({
          id: crypto.randomUUID(),
          content,
          month,
          created_at: localISO,
        })
        .execute();
    }
  },
};
