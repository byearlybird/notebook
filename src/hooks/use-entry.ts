import type { Selectable } from "kysely";
import type { NoteTable, TaskTable } from "@/db/schema";
import { useDBQuery } from "./use-db-query";

type EntryRowMap = {
  note: Selectable<NoteTable>;
  task: Selectable<TaskTable>;
};

export function useEntry<T extends "note" | "task">(type: T, id: string): EntryRowMap[T] | null {
  const rows = useDBQuery((db) =>
    type === "note"
      ? db.selectFrom("notes").selectAll().where("id", "=", id)
      : db.selectFrom("tasks").selectAll().where("id", "=", id),
  );

  return (rows?.[0] as EntryRowMap[T]) ?? null;
}
