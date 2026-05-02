import type { ColumnType } from "kysely";

type ClientState = {
  last_server_seq: number;
  hlc_wall: number;
  hlc_count: number;
  node_id: string;
  is_applying_remote: number;
};

export type SyncableRow = {
  id: string;
  hlc: ColumnType<string, string | undefined, string | undefined>;
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

export type MoodTable = SyncableRow & {
  value: number;
  date: string;
  created_at: string;
  label: string | null;
};

export type MomentTable = SyncableRow & {
  content: string;
  image: Uint8Array | null;
  thumbnail: Uint8Array | null;
  date: string;
  created_at: string;
  content_edited_at: string | null;
  label: string | null;
};

type LabelTable = SyncableRow & {
  name: string;
};

type TimelineView = {
  id: string;
  type: "note" | "task" | "mood" | "moment";
  content: string | null;
  value: number | null;
  created_at: string;
  status: TaskTable["status"] | null;
  pinned: number;
  has_image: number;
  label_name: string | null;
};

type SyncChanges = {
  table_name: keyof DBSchema;
  row_id: string;
  hlc: string;
  operation: "mutate" | "tombstone";
};

type TombstoneTable = { row_id: string; hlc: string };

export type DBSchema = {
  notes: NoteTable;
  tasks: TaskTable;
  intentions: IntentionTable;
  moods: MoodTable;
  moments: MomentTable;
  timeline: TimelineView;
  labels: LabelTable;
  sync_changes: SyncChanges;
  client_state: ClientState;
  tombstone_table: TombstoneTable;
};
