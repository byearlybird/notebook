import { notesRepo } from "@/repos/notes-repo";
import { tasksRepo } from "@/repos/tasks-repo";
import { intentionRepo } from "@/repos/intention-repo";
import { goalRepo } from "@/repos/goal-repo";
import type { TimelineItem } from "@/features/entries/types";

export async function getEntriesToday(): Promise<TimelineItem[]> {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const [notes, tasks] = await Promise.all([
    notesRepo.findByDate(today),
    tasksRepo.findByDate(today),
  ]);

  const entries: TimelineItem[] = [
    ...notes.map((note) => ({ ...note, type: "note" as const })),
    ...tasks.map((task) => ({ ...task, type: "task" as const })),
  ];

  return entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getEntriesGroupedByDate(): Promise<Record<string, TimelineItem[]>> {
  const [notes, tasks, intentions, goals] = await Promise.all([
    notesRepo.findAll(),
    tasksRepo.findAll(),
    intentionRepo.findAll(),
    goalRepo.findAll(),
  ]);

  const noteEntries: TimelineItem[] = notes.map((note) => ({
    ...note,
    type: "note" as const,
  }));

  const taskEntries: TimelineItem[] = tasks.map((task) => ({
    ...task,
    type: "task" as const,
  }));

  const intentionEntries: TimelineItem[] = intentions.map((intention) => ({
    id: intention.id,
    content: intention.content,
    created_at: intention.created_at,
    type: "intention" as const,
  }));

  const goalEntries: TimelineItem[] = goals.map((goal) => ({
    id: goal.id,
    content: goal.content,
    created_at: goal.created_at,
    status: goal.status,
    type: "goal" as const,
  }));

  const allEntries = [...noteEntries, ...taskEntries, ...intentionEntries, ...goalEntries].sort(
    (a, b) => b.created_at.localeCompare(a.created_at),
  );

  const entriesByDate: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    const date = new Date(entry.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    entriesByDate[date] ??= [];
    entriesByDate[date].push(entry);
  }

  return entriesByDate;
}
