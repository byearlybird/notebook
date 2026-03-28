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
