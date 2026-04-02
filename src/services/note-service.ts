import type { Database } from "@/db/schema";
import { toNote, type Note } from "@/models";
import { extractPlainText } from "@/utils/extract-plain-text";
import type { Kysely } from "kysely";
import { fetchLabelMap } from "./label-helpers";

export function createNoteService(db: Kysely<Database>) {
  return {
    create: async (content: string, labelId?: string | null) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.transaction().execute(async (trx) => {
        await trx
          .insertInto("entries")
          .values({
            id,
            date: new Date().toLocaleDateString("en-CA"),
            content,
            type: "note",
            status: null,
            labelId: labelId ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        await trx
          .insertInto("entrySearchMeta")
          .values({ entryId: id, plainText: extractPlainText(content) })
          .execute();
      });
    },
    get: async (id: string): Promise<Note | undefined> => {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "note")
        .executeTakeFirst();
      if (!result) return undefined;
      const labelMap = await fetchLabelMap(db, [result.labelId]);
      return toNote(result, result.labelId ? (labelMap.get(result.labelId) ?? null) : null);
    },
    update: async (id: string, { content }: { content: string }) => {
      await db.transaction().execute(async (trx) => {
        await trx
          .updateTable("entries")
          .set({
            content,
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", id)
          .where("type", "=", "note")
          .execute();
        await trx
          .insertInto("entrySearchMeta")
          .values({ entryId: id, plainText: extractPlainText(content) })
          .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText: extractPlainText(content) }))
          .execute();
      });
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
      const labelMap = await fetchLabelMap(db, results.map((r) => r.labelId));
      return results.map((r) => toNote(r, r.labelId ? (labelMap.get(r.labelId) ?? null) : null));
    },
    setLabel: async (noteId: string, labelId: string | null) => {
      await db
        .updateTable("entries")
        .set({ labelId })
        .where("id", "=", noteId)
        .where("type", "=", "note")
        .execute();
    },
  };
}
