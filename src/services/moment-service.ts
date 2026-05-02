import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const momentService = {
  async createMoment(
    content: string,
    display: Uint8Array | null = null,
    thumbnail: Uint8Array | null = null,
    label: string | null = null,
  ) {
    const localISO = toLocalISO(new Date());
    await db
      .insertInto("moments")
      .values({
        id: crypto.randomUUID(),
        content,
        image: display,
        thumbnail,
        label,
        date: localISO.slice(0, 10),
        created_at: localISO,
        content_edited_at: null,
      })
      .execute();
  },
  async delete(id: string) {
    await db.deleteFrom("moments").where("id", "=", id).execute();
  },
  async updateContent(id: string, content: string) {
    await db
      .updateTable("moments")
      .set({ content, content_edited_at: toLocalISO(new Date()) })
      .where("id", "=", id)
      .execute();
  },
};
