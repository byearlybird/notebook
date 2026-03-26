import type { Database } from "@/db/schema";
import { toNote, type Note } from "@/models";
import type { Kysely } from "kysely";

export function createNoteService(db: Kysely<Database>) {
  return {
    create: async (content: string) => {
      const now = new Date().toISOString();
      await db
        .insertInto("entries")
        .values({
          id: crypto.randomUUID(),
          date: new Date().toLocaleDateString("en-CA"),
          content,
          type: "note",
          status: null,
          createdAt: now,
          updatedAt: now,
        })
        .execute();
    },
    get: async (id: string): Promise<Note | undefined> => {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "note")
        .executeTakeFirst();
      return result ? toNote(result) : undefined;
    },
    update: async (id: string, { content }: { content: string }) => {
      await db
        .updateTable("entries")
        .set({
          content,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "note")
        .execute();
    },
    delete: async (id: string) => {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "note").execute();
    },
    togglePin: async (id: string, pinned: boolean) => {
      await db
        .updateTable("entries")
        .set({
          status: pinned ? "pinned" : null,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "note")
        .execute();
    },
    getPinned: async (): Promise<Note[]> => {
      const results = await db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", "note")
        .where("status", "=", "pinned")
        .orderBy("updatedAt", "desc")
        .execute();
      return results.map(toNote);
    },
  };
}
