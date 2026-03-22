type BaseEntry = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = BaseEntry & { type: "note" };

export type Intention = BaseEntry & { type: "intention" };

export type Task = BaseEntry & {
  type: "task";
  status: "incomplete" | "complete" | "canceled" | "deferred";
  originId: string | null;
};

export type Goal = BaseEntry & {
  type: "goal";
  status: "incomplete" | "complete";
};

export type Entry = Note | Intention | Task | Goal;

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
