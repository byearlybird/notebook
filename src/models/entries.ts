import type { EntryRow } from "@/db";
import {
  InvalidEntryTypeError,
  UnknownEntryType,
  type Entry,
  type Intention,
  type Label,
  type Note,
  type Task,
} from "./types";

export function toNote(row: EntryRow, label: Label | null = null): Note {
  if (row.type !== "note") {
    throw new InvalidEntryTypeError("note");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "note",
    status: row.status as Note["status"],
    label,
  };
}

export function toIntention(row: EntryRow): Intention {
  if (row.type !== "intention") {
    throw new InvalidEntryTypeError("intention");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "intention",
  };
}

export function toTask(row: EntryRow, label: Label | null = null): Task {
  if (row.type !== "task") {
    throw new InvalidEntryTypeError("task");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "task",
    status: row.status as Task["status"],
    originId: row.originId,
    label,
  };
}

function toLabelMap(labels: Label[]): Map<string, Label> {
  return new Map(labels.map((l) => [l.id, l]));
}

function resolveLabel(row: EntryRow, labelMap: Map<string, Label>): Label | null {
  return row.labelId ? (labelMap.get(row.labelId) ?? null) : null;
}

export function toEntries(rows: EntryRow[], labels: Label[]): Entry[] {
  const labelMap = toLabelMap(labels);
  return rows.map((row) => toEntry(row, resolveLabel(row, labelMap)));
}

export function toNotes(rows: EntryRow[], labels: Label[]): Note[] {
  const labelMap = toLabelMap(labels);
  return rows.map((row) => toNote(row, resolveLabel(row, labelMap)));
}

export function toTasks(rows: EntryRow[], labels: Label[]): Task[] {
  const labelMap = toLabelMap(labels);
  return rows.map((row) => toTask(row, resolveLabel(row, labelMap)));
}

export function toEntry(row: EntryRow, label: Label | null = null): Entry {
  switch (row.type) {
    case "note":
      return toNote(row, label);
    case "intention":
      return toIntention(row);
    case "task":
      return toTask(row, label);
    default:
      throw new UnknownEntryType(row.type);
  }
}
