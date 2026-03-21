import type { Goal } from "@/db/schema";
import * as intentionService from "@/services/intention-service";
import * as goalService from "@/services/goal-service";
import { useRouter } from "@tanstack/react-router";

export function useUpdateIntention() {
  const router = useRouter();

  return async (month: string, content: string) => {
    await intentionService.upsertIntention(month, content);
    await router.invalidate();
  };
}

export function useAddGoal() {
  const router = useRouter();

  return async (month: string, content: string) => {
    await goalService.addGoal(month, content);
    await router.invalidate();
  };
}

export function useUpdateGoal() {
  const router = useRouter();

  return async (id: string, updates: Partial<Pick<Goal, "content" | "status">>) => {
    await goalService.updateGoal(id, updates);
    await router.invalidate();
  };
}

export function useDeleteGoal() {
  const router = useRouter();

  return async (id: string) => {
    await goalService.deleteGoal(id);
    await router.invalidate();
  };
}

export function useToggleGoalStatus() {
  const router = useRouter();

  return async (id: string) => {
    await goalService.toggleGoalStatus(id);
    await router.invalidate();
  };
}
