import { notesRepo } from "@/repos/notes-repo";
import { tasksRepo } from "@/repos/tasks-repo";
import type { TimelineItem } from "@/features/entries/types";
import { getAllMonthlyLogs } from "@/services/monthly-log-service";

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

export async function getEntriesGroupedByDate(): Promise<
  Record<string, TimelineItem[]>
> {
  const [notes, tasks, allLogs] = await Promise.all([
    notesRepo.findAll(),
    tasksRepo.findAll(),
    getAllMonthlyLogs(),
  ]);

  const noteEntries: TimelineItem[] = notes.map((note) => ({
    ...note,
    type: "note" as const,
  }));

  const taskEntries: TimelineItem[] = tasks.map((task) => ({
    ...task,
    type: "task" as const,
  }));

  const intentionEntries: TimelineItem[] = allLogs
    .filter((log) => log.intention)
    .map((log) => ({
      id: log.id,
      content: log.intention!,
      created_at: log.created_at,
      type: "intention" as const,
    }));

  const goalEntries: TimelineItem[] = allLogs.flatMap((log) =>
    log.goals.map((goal) => ({
      id: goal.id,
      content: goal.content,
      created_at: goal.created_at,
      status: goal.status,
      type: "goal" as const,
    })),
  );

  const allEntries = [
    ...noteEntries,
    ...taskEntries,
    ...intentionEntries,
    ...goalEntries,
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const entriesByDate: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    const date = new Date(entry.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    entriesByDate[date] ??= [];
    entriesByDate[date].push(entry);
  }

  return entriesByDate;
}
