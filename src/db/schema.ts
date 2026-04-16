type ClientState = {
  last_server_seq: number;
  hlc_wall: number;
  hlc_count: number;
  node_id: string;
};

export type SyncableRow = {
  id: string;
  hlc: string;
  is_deleted: number;
};

type Note = SyncableRow & {
  content: string;
  created_at: string;
  edited_at: string | null;
  status: "pinned" | null;
};

type SyncChanges = {
  table_name: keyof DBSchema;
  row_id: string;
  hlc: string;
};

export type DBSchema = {
  notes: Note;
  sync_changes: SyncChanges;
  client_state: ClientState;
};
