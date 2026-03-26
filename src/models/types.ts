type BaseEntry = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = BaseEntry & { type: "note"; status: null | "pinned" };

export type Intention = BaseEntry & { type: "intention" };

export type Task = BaseEntry & {
  type: "task";
  status: "incomplete" | "complete" | "canceled" | "deferred";
  originId: string | null;
};

export type Entry = Note | Intention | Task;

export class InvalidEntryTypeError extends Error {
  constructor(type: string) {
    super(`Row is not of type: ${type}`);
  }
}

export class UnknownEntryType extends Error {
  constructor(type: string) {
    super(`Unknown entry type: ${type}`);
  }
}
