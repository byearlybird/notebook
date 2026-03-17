import type { NewTask } from "./schema";
import { tasksRepo } from "@/repos/tasks-repo";

const yesterday = new Date(Date.now() - 86_400_000);
const yesterdayISO: string = yesterday.toISOString();
const yesterdayDate: string = yesterday.toLocaleDateString("en-CA");

const SEED_TASKS: NewTask[] = [
  {
    id: "5c12de98-f51b-4996-aa29-6542c8575112",
    content: "Seed task one",
    scope: "daily",
    created_at: yesterdayISO,
    date: yesterdayDate,
  },
  {
    id: "36101c56-fdad-474d-9f4c-661e1e492b70",
    content: "Seed task two",
    scope: "daily",
    status: "incomplete",
    created_at: yesterdayISO,
    date: yesterdayDate,
  },
  {
    id: "8f3eab3f-986b-4cbc-8854-429c35a382aa",
    content: "Seed task three",
    scope: "weekly",
    status: "incomplete",
  },
];

export async function seed() {
  console.log("Running seed...");
  for (const task of SEED_TASKS) {
    const existing = await tasksRepo.findById(task.id!);
    if (!existing) {
      await tasksRepo.create(task);
    }
  }
}
