import type { Goal } from "@/db/schema";
import { goalService, intentionService } from "@/app";
import { useRouter } from "@tanstack/react-router";

export function useUpdateIntention() {
  const router = useRouter();

  return async (month: string, content: string) => {
    await intentionService.upsert(month, content);
    await router.invalidate();
  };
}

export function useAddGoal() {
  const router = useRouter();

  return async (month: string, content: string) => {
    await goalService.create(month, content);
    await router.invalidate();
  };
}

export function useUpdateGoal() {
  const router = useRouter();

  return async (id: string, updates: Partial<Pick<Goal, "content" | "status">>) => {
    await goalService.update(id, updates);
    await router.invalidate();
  };
}

export function useDeleteGoal() {
  const router = useRouter();

  return async (id: string) => {
    await goalService.delete(id);
    await router.invalidate();
  };
}

export function useSetGoalStatus() {
  const router = useRouter();

  return async (id: string, status: Goal["status"]) => {
    await goalService.setStatus(id, status);
    await router.invalidate();
  };
}
