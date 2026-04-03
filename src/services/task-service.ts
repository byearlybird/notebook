import { toTask, toTasks, type Task } from "@/models";
import type { EntryRepo } from "@/repos/entry-repo";
import type { LabelRepo } from "@/repos/label-repo";

export function createTaskService(entryRepo: EntryRepo, labelRepo: LabelRepo) {
  return {
    async create(content: string, labelId?: string | null) {
      await entryRepo.create({
        date: new Date().toLocaleDateString("en-CA"),
        content,
        type: "task",
        status: "incomplete",
        originId: null,
        labelId: labelId ?? null,
      });
    },
    async get(id: string): Promise<Task | undefined> {
      const result = await entryRepo.get(id);
      if (!result || result.type !== "task") return undefined;
      const label = result.labelId ? ((await labelRepo.get(result.labelId)) ?? null) : null;
      return toTask(result, label);
    },
    async update(id: string, updates: Partial<Pick<Task, "content" | "status">>) {
      await entryRepo.update(id, updates);
    },
    async delete(id: string) {
      await entryRepo.delete(id);
    },
    async getByStatus(status: Task["status"]): Promise<Task[]> {
      const results = await entryRepo.getByStatus("task", status);
      const ids = results.map((r) => r.labelId).filter((id): id is string => id != null);
      return toTasks(results, await labelRepo.getByIds(ids));
    },
    async getFirstByOriginalId(originId: string): Promise<Task | undefined> {
      const result = await entryRepo.getByOriginId(originId);
      if (!result) return undefined;
      const label = result.labelId ? ((await labelRepo.get(result.labelId)) ?? null) : null;
      return toTask(result, label);
    },
    async rollover(taskId: string, targetDate: string) {
      const existingTask = await entryRepo.get(taskId);
      if (!existingTask || existingTask.type !== "task") {
        throw new Error(`Task ${taskId} not found`);
      }

      await entryRepo.transaction(async (trx) => {
        await entryRepo.update(taskId, { status: "deferred" }, trx);
        await entryRepo.create(
          {
            date: targetDate,
            content: existingTask.content,
            type: "task",
            status: "incomplete",
            originId: existingTask.id,
            labelId: null,
          },
          trx,
        );
      });
    },
    async setLabel(taskId: string, labelId: string | null) {
      await entryRepo.update(taskId, { labelId });
    },
  };
}
