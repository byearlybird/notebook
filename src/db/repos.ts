import { type Note, type Task, type NewNote, type NewTask, noteSchema, taskSchema } from "./schema";

const today = new Date().toISOString().split("T")[0];
const now = new Date().toISOString();

const demoNotes: Note[] = [
  {
    id: "demo-note-1",
    content: "Started the morning with a long walk. Clear skies, cool air.",
    date: today,
    scope: "daily",
    category: "log",
    created_at: now,
    updated_at: now,
    is_deleted: 0,
  },
  {
    id: "demo-note-2",
    content: "Feeling grateful for the small wins this week.",
    date: today,
    scope: "daily",
    category: "reflection",
    created_at: now,
    updated_at: now,
    is_deleted: 0,
  },
];

const demoTasks: Task[] = [
  {
    id: "demo-task-1",
    content: "Review weekly goals and plan next steps",
    date: today,
    scope: "daily",
    status: "incomplete",
    created_at: now,
    updated_at: now,
    is_deleted: 0,
  },
];

// Notes repository
export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return demoNotes;
  },

  async findById(id: string): Promise<Note | undefined> {
    return demoNotes.find((n) => n.id === id);
  },

  async create(note: NewNote): Promise<Note> {
    return noteSchema.parse(note);
  },

  async update(id: string, _updates: Partial<Note>): Promise<Note | undefined> {
    return this.findById(id);
  },

  async delete(_id: string): Promise<void> {},
};

// Tasks repository
export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return demoTasks;
  },

  async findById(id: string): Promise<Task | undefined> {
    return demoTasks.find((t) => t.id === id);
  },

  async create(task: NewTask): Promise<Task> {
    return taskSchema.parse(task);
  },

  async update(id: string, _updates: Partial<Task>): Promise<Task | undefined> {
    return this.findById(id);
  },

  async delete(_id: string): Promise<void> {},
};
