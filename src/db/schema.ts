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
