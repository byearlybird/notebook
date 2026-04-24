import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const notesService = {
  async togglePin(id: string) {
    const note = await db
      .selectFrom("notes")
      .select("pinned")
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    await db
      .updateTable("notes")
      .set({ pinned: note.pinned ? 0 : 1 })
      .where("id", "=", id)
      .execute();
  },
  async delete(id: string) {
    await db.updateTable("notes").set({ is_deleted: 1 }).where("id", "=", id).execute();
  },
  async updateContent(id: string, content: string) {
    await db
      .updateTable("notes")
      .set({ content, content_edited_at: toLocalISO(new Date()) })
      .where("id", "=", id)
      .execute();
  },
  async createNote(content: string, label: string | null = null) {
    const now = new Date();
    const localISO = toLocalISO(now);
    await db
      .insertInto("notes")
      .values({
        id: crypto.randomUUID(),
        content,
        label,
        date: localISO.slice(0, 10),
        created_at: localISO,
      })
      .execute();
  },
};
