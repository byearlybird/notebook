import type { MonthlyGoal, MonthlyLog } from "@/db/schema";
import { monthlyGoalRepo } from "@/repos/monthly-goal-repo";
import { monthlyLogRepo } from "@/repos/monthly-log-repo";

export async function getOrCreateMonthlyLog(month: string): Promise<MonthlyLog> {
  const existing = await monthlyLogRepo.findByMonth(month);
  if (existing) return existing;
  return monthlyLogRepo.create({ month });
}

export async function updateIntention(
  logId: string,
  intention: string | null,
): Promise<MonthlyLog | undefined> {
  return monthlyLogRepo.update(logId, { intention });
}

export async function addGoal(logId: string, content: string): Promise<MonthlyGoal> {
  return monthlyGoalRepo.create({
    monthly_log_id: logId,
    content,
  });
}

export async function updateGoal(
  id: string,
  updates: Partial<Pick<MonthlyGoal, "content" | "status">>,
): Promise<MonthlyGoal | undefined> {
  return monthlyGoalRepo.update(id, updates);
}

export async function deleteGoal(id: string): Promise<void> {
  return monthlyGoalRepo.delete(id);
}

export async function toggleGoalStatus(id: string): Promise<MonthlyGoal | undefined> {
  const goal = await monthlyGoalRepo.findById(id);
  if (!goal) return undefined;
  const newStatus = goal.status === "incomplete" ? "complete" : "incomplete";
  return monthlyGoalRepo.update(id, { status: newStatus });
}

export async function getAllMonthlyLogs(): Promise<(MonthlyLog & { goals: MonthlyGoal[] })[]> {
  const [logs, allGoals] = await Promise.all([
    monthlyLogRepo.findAll(),
    monthlyGoalRepo.findAll(),
  ]);

  const goalsByLogId = Map.groupBy(allGoals, (g) => g.monthly_log_id);

  return logs.map((log) => ({
    ...log,
    goals: goalsByLogId.get(log.id) ?? [],
  }));
}
