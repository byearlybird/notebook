import { taskService } from "@/app";
import { notFound } from "@tanstack/react-router";
import type { Task } from "@/models";
import { queryOptions } from "@tanstack/react-query";

export const taskQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "tasks", id],
    queryFn: async (): Promise<Task> => {
      const task = await taskService.get(id);
      if (!task) throw notFound();
      return task;
    },
  });

export const tasksByStatusQueryOptions = (status: Task["status"]) =>
  queryOptions({
    queryKey: ["entries", "tasks", "byStatus", status],
    queryFn: () => taskService.getByStatus(status),
  });

export const rolledTaskQueryOptions = (originId: string) =>
  queryOptions({
    queryKey: ["entries", "tasks", "rolled", originId],
    queryFn: () => taskService.getFirstByOriginalId(originId),
  });
