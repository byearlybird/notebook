import type { Goal } from "@/db/schema";
import { goalRepo } from "@/repos/goal-repo";

export async function addGoal(month: string, content: string): Promise<Goal> {
  return goalRepo.create({ month, content });
}

export async function updateGoal(
  id: string,
  updates: Partial<Pick<Goal, "content" | "status">>,
): Promise<Goal | undefined> {
  return goalRepo.update(id, updates);
}

export async function deleteGoal(id: string): Promise<void> {
  return goalRepo.delete(id);
}

export async function toggleGoalStatus(id: string): Promise<Goal | undefined> {
  const goal = await goalRepo.findById(id);
  if (!goal) return undefined;
  const newStatus = goal.status === "incomplete" ? "complete" : "incomplete";
  return goalRepo.update(id, { status: newStatus });
}

export async function getGoalsByMonth(month: string): Promise<Goal[]> {
  return goalRepo.findByMonth(month);
}
