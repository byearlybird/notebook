import { notesRepo, tasksRepo } from "@app/db";
import type { TimelineItem } from "./types";

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
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

  const noteEntries: TimelineItem[] = notes.map((note) => ({
    ...note,
    type: "note" as const,
  }));

  const taskEntries: TimelineItem[] = tasks.map((task) => ({
    ...task,
    type: "task" as const,
  }));

  const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  const grouped: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    const date = new Date(entry.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    grouped[date] ??= [];
    grouped[date].push(entry);
  }
  return grouped;
}
