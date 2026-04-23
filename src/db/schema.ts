import type { ColumnType } from "kysely";

type ClientState = {
  last_server_seq: number;
  hlc_wall: number;
  hlc_count: number;
  node_id: string;
};

export type SyncableRow = {
  id: string;
  hlc: ColumnType<string, string | undefined, string | undefined>;
  is_deleted: ColumnType<number, number | undefined, number | undefined>;
};

export type NoteTable = SyncableRow & {
  content: string;
  date: string;
  created_at: string;
  content_edited_at: string | null;
  label: string | null;
  pinned: ColumnType<number, number | undefined, number>;
};

export type TaskTable = SyncableRow & {
  content: string;
  date: string;
  status: "incomplete" | "complete" | "cancelled" | "deferred";
  created_at: string;
  content_edited_at: string | null;
  label: string | null;
};

export type IntentionTable = SyncableRow & {
  content: string;
  month: string;
  created_at: string;
  content_edited_at: string | null;
};

type LabelTable = SyncableRow & {
  name: string;
};

type TimelineView = {
  id: string;
  type: "note" | "task";
  content: string;
  created_at: string;
  status: TaskTable["status"] | null;
  pinned: number;
};

type SyncChanges = {
  table_name: keyof DBSchema;
  row_id: string;
  hlc: string;
};

export type DBSchema = {
  notes: NoteTable;
  tasks: TaskTable;
  intentions: IntentionTable;
  timeline: TimelineView;
  labels: LabelTable;
  sync_changes: SyncChanges;
  client_state: ClientState;
};
