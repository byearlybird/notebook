import type { Task } from "@/db";
import { tasksRepo } from "@/repos/tasks-repo";

export async function createTask(content: string): Promise<Task> {
  return tasksRepo.create({
    content,
    scope: "daily",
  });
}

export async function updateTask(
  id: string,
  { content }: { content: string },
): Promise<Task | undefined> {
  return tasksRepo.update(id, { content });
}

export async function updateTaskStatus(
  id: string,
  status: Task["status"],
): Promise<Task | undefined> {
  return tasksRepo.update(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  return tasksRepo.delete(id);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return tasksRepo.findById(id);
}

export async function getTaskWithRolled(
  id: string,
): Promise<{ task: Task; rolledTask: Task | null }> {
  const task = await tasksRepo.findById(id);
  if (!task) {
    throw new Error("Task not found");
  }
  const rolledTask =
    task.status === "deferred"
      ? ((await tasksRepo.findByOriginalId(task.original_id ?? task.id)) ?? null)
      : null;
  return { task, rolledTask };
}

export async function getIncompleteTasks(): Promise<{ todayTasks: Task[]; priorTasks: Task[] }> {
  const incompleteTasks = await tasksRepo.findIncomplete();
  const today = new Date().toLocaleDateString("en-CA");
  const todayTasks = incompleteTasks.filter((t) => t.date === today);
  const priorTasks = incompleteTasks.filter((t) => t.date < today);
  return { todayTasks, priorTasks };
}

export async function rolloverTask(
  taskId: string,
  targetDate: string,
): Promise<{ original: Task; rolled: Task }> {
  const task = await tasksRepo.findById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status !== "incomplete") {
    throw new Error("Only incomplete tasks can be rolled over");
  }

  if (task.date === targetDate) {
    return { original: task, rolled: task };
  }

  const deferred = await tasksRepo.update(task.id, { status: "deferred" });
  if (!deferred) {
    throw new Error("Failed to defer task");
  }

  const rolled = await tasksRepo.create({
    content: deferred.content,
    scope: deferred.scope,
    date: targetDate,
    status: "incomplete",
    // presence of original_id indicates the original task was rolled over before, so keep it's original id
    original_id: task.original_id ?? deferred.id,
  });

  return { original: deferred, rolled };
}
