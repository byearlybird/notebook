import type { Intention } from "@/db/schema";
import { intentionRepo } from "@/repos/intention-repo";

export async function getIntentionForMonth(month: string): Promise<Intention | undefined> {
  return intentionRepo.findByMonth(month);
}

export async function upsertIntention(month: string, content: string): Promise<Intention> {
  const existing = await intentionRepo.findByMonth(month);
  if (existing) {
    const updated = await intentionRepo.update(existing.id, { content });
    return updated!;
  }
  return intentionRepo.create({ month, content });
}
