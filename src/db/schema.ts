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

type Todo = SyncableRow & {
  content: string;
  completed: number;
  category_id: string | null;
  created_at: string;
};

type Category = SyncableRow & {
  name: string;
  created_at: string;
};

type SyncChanges = {
  table_name: keyof DBSchema;
  row_id: string;
  hlc: string;
};

export type DBSchema = {
  todos: Todo;
  categories: Category;
  sync_changes: SyncChanges;
  client_state: ClientState;
};
