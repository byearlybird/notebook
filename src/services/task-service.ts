import type { Database } from "@/db/schema";
import { toTask, type Task } from "@/models";
import { extractPlainText } from "@/utils/extract-plain-text";
import type { Kysely } from "kysely";
import { fetchLabelMap } from "./label-helpers";

export function createTaskService(db: Kysely<Database>) {
  return {
    async create(content: string, labelId?: string | null) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.transaction().execute(async (trx) => {
        await trx
          .insertInto("entries")
          .values({
            id,
            date: new Date().toLocaleDateString("en-CA"),
            content,
            type: "task",
            status: "incomplete",
            originId: null,
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
    async get(id: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "task")
        .executeTakeFirst();
      if (!result) return undefined;
      const labelMap = await fetchLabelMap(db, [result.labelId]);
      return toTask(result, result.labelId ? (labelMap.get(result.labelId) ?? null) : null);
    },
    async update(id: string, updates: Partial<Pick<Task, "content" | "status">>) {
      await db.transaction().execute(async (trx) => {
        await trx
          .updateTable("entries")
          .set({
            ...updates,
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", id)
          .where("type", "=", "task")
          .execute();
        if (updates.content !== undefined) {
          const plainText = extractPlainText(updates.content);
          await trx
            .insertInto("entrySearchMeta")
            .values({ entryId: id, plainText })
            .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText }))
            .execute();
        }
      });
    },
    async delete(id: string) {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "task").execute();
    },
    async getByStatus(status: Task["status"]): Promise<Task[]> {
      const results = await db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", "task")
        .where("status", "=", status)
        .execute();
      const labelMap = await fetchLabelMap(db, results.map((r) => r.labelId));
      return results.map((r) => toTask(r, r.labelId ? (labelMap.get(r.labelId) ?? null) : null));
    },
    async getFirstByOriginalId(originId: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("originId", "=", originId)
        .executeTakeFirst();
      if (!result) return undefined;
      const labelMap = await fetchLabelMap(db, [result.labelId]);
      return toTask(result, result.labelId ? (labelMap.get(result.labelId) ?? null) : null);
    },
    async rollover(taskId: string, targetDate: string) {
      await db.transaction().execute(async (trx) => {
        const existingTask = await trx
          .updateTable("entries")
          .set({
            status: "deferred",
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", taskId)
          .where("type", "=", "task")
          .returningAll()
          .executeTakeFirstOrThrow();
        const now = new Date().toISOString();
        const newId = crypto.randomUUID();
        await trx
          .insertInto("entries")
          .values({
            id: newId,
            date: targetDate,
            content: existingTask.content,
            type: "task",
            status: "incomplete",
            originId: existingTask.id,
            labelId: null,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        await trx
          .insertInto("entrySearchMeta")
          .values({ entryId: newId, plainText: extractPlainText(existingTask.content) })
          .execute();
      });
    },
    async setLabel(taskId: string, labelId: string | null) {
      await db
        .updateTable("entries")
        .set({ labelId })
        .where("id", "=", taskId)
        .where("type", "=", "task")
        .execute();
    },
  };
}
