import { type Database, noteSchema } from "@/db";
import type { Kysely } from "kysely";

export function createNoteService(db: Kysely<Database>) {
  return {
    create: (content: string) => {
      const note = noteSchema.parse({ content });
      return db.insertInto("notes").values(note).execute();
    },
    get: async (id: string) => {
      return db.selectFrom("notes").where("id", "=", id).selectAll().executeTakeFirst();
    },
    update: async (id: string, { content }: { content: string }) => {
      return db.updateTable("notes").set({ content }).where("id", "=", id).execute();
    },
    delete: (id: string) => {
      return db.deleteFrom("notes").where("id", "=", id).execute();
    },
  };
}

export type NoteService = ReturnType<typeof createNoteService>;
