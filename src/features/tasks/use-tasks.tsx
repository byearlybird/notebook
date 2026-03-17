import type { Task } from "@/db";
import * as tasksService from "@/services/tasks-service";
import { useRouter } from "@tanstack/react-router";

export function useCreateTask() {
  const router = useRouter();

  return async (task: { content: string }) => {
    await tasksService.createTask(task.content);
    await router.invalidate();
  };
}

export function useUpdateTaskStatus() {
  const router = useRouter();

  return async ({ id, status }: { id: string; status: Task["status"] }) => {
    await tasksService.updateTaskStatus(id, status);
    await router.invalidate();
  };
}

export function useUpdateTask() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await tasksService.updateTask(id, { content });
    await router.invalidate();
  };
}

export function useRolloverTask() {
  const router = useRouter();

  return async (id: string, targetDate: string) => {
    await tasksService.rolloverTask(id, targetDate);
    await router.invalidate();
  };
}
