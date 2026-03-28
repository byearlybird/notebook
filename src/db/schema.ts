export type EntryRow = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "note" | "task" | "intention";
  status: string | null;
  originId: string | null;
  labelId: string | null;
};

export type LabelRow = {
  id: string;
  name: string;
};

export type Database = {
  entries: EntryRow;
  labels: LabelRow;
};
