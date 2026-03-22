export type EntryRow = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "note" | "task" | "intention" | "goal";
  status: string | null;
  originId: string | null;
};

export type Database = {
  entries: EntryRow;
};
