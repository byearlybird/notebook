import { tasksRepo, type Task, type NewTask } from "@app/db";
import { useRouter } from "@tanstack/react-router";

export function useCreateTask() {
  const router = useRouter();

  return async (task: Pick<NewTask, "content">) => {
    await tasksRepo.create({
      content: task.content,
      scope: "daily",
    });
    await router.invalidate();
  };
}

export function useUpdateTaskStatus() {
  const router = useRouter();

  return async ({ id, status }: { id: string; status: Task["status"] }) => {
    await tasksRepo.update(id, { status });
    await router.invalidate();
  };
}

export function useUpdateTask() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await tasksRepo.update(id, { content });
    await router.invalidate();
  };
}
