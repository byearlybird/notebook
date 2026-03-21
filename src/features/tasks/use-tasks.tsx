import { taskService } from "@/app";
import type { Task } from "@/db";
import { useRouter } from "@tanstack/react-router";

export function useCreateTask() {
  const router = useRouter();

  return async (task: { content: string }) => {
    await taskService.create(task.content);
    await router.invalidate();
  };
}

export function useUpdateTaskStatus() {
  const router = useRouter();

  return async ({ id, status }: { id: string; status: Task["status"] }) => {
    await taskService.update(id, { status });
    await router.invalidate();
  };
}

export function useUpdateTask() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await taskService.update(id, { content });
    await router.invalidate();
  };
}

export function useRolloverTask() {
  const router = useRouter();

  return async (id: string, targetDate: string) => {
    await taskService.rollover(id, targetDate);
    await router.invalidate();
  };
}
