import { writeFileSync } from "node:fs";
import { join } from "node:path";

type EntryRow = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "note" | "task" | "intention";
  status: string | null;
  originId: string | null;
};

type DatabaseDump = {
  entries: EntryRow[];
  schema_version: number;
};

let idCounter = 0;
function generateId(): string {
  idCounter++;
  return `seed-${idCounter.toString().padStart(4, "0")}`;
}

function lexical(text: string): string {
  return JSON.stringify({
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text, format: 0 }],
        },
      ],
    },
  });
}

function ts(date: string, hour: number, minute = 0): string {
  const h = hour.toString().padStart(2, "0");
  const m = minute.toString().padStart(2, "0");
  return `${date}T${h}:${m}:00.000`;
}

function entry(
  overrides: Partial<EntryRow> & Pick<EntryRow, "date" | "content" | "type">,
): EntryRow {
  const id = overrides.id ?? generateId();
  const created = overrides.createdAt ?? ts(overrides.date, 9);
  return {
    id,
    date: overrides.date,
    content: overrides.content,
    createdAt: created,
    updatedAt: overrides.updatedAt ?? created,
    type: overrides.type,
    status: overrides.status ?? null,
    originId: overrides.originId ?? null,
  };
}

function task(
  date: string,
  text: string,
  status: "complete" | "incomplete" | "canceled",
  opts?: { hour?: number; originId?: string; id?: string },
): EntryRow {
  const hour = opts?.hour ?? 9;
  return entry({
    id: opts?.id,
    date,
    content: lexical(text),
    type: "task",
    status,
    createdAt: ts(date, hour),
    updatedAt: ts(date, hour, 5),
    originId: opts?.originId ?? null,
  });
}

function note(
  date: string,
  text: string,
  opts?: { hour?: number; pinned?: boolean },
): EntryRow {
  const hour = opts?.hour ?? 10;
  const e = entry({
    date,
    content: lexical(text),
    type: "note",
    createdAt: ts(date, hour),
    updatedAt: ts(date, hour, 2),
    status: opts?.pinned ? "pinned" : null,
  });
  return e;
}

function intention(date: string, text: string): EntryRow {
  return entry({
    date,
    content: lexical(text),
    type: "intention",
    createdAt: ts(date, 8),
    updatedAt: ts(date, 8, 1),
  });
}

// --- IDs for the deferred task chain ---
const caseStudyId1 = "seed-cs-1";
const caseStudyId2 = "seed-cs-2";
const caseStudyId3 = "seed-cs-3";
const caseStudyId4 = "seed-cs-4";

const entries: EntryRow[] = [
  // === March 12 (Thursday) — Intention + busy day ===
  intention(
    "2026-03-12",
    "Ship the portfolio and find a rhythm that sticks.",
  ),
  task("2026-03-12", "Client logo revisions", "complete", { hour: 9 }),
  task("2026-03-12", "Reply to Sarah's text", "complete", { hour: 10 }),
  task("2026-03-12", "Grocery run — out of coffee and eggs", "complete", {
    hour: 17,
  }),
  task("2026-03-12", "Write case study for the wayfinding project", "incomplete", {
    hour: 14,
    id: caseStudyId1,
  }),
  note(
    "2026-03-12",
    "Morning block worked again. Three hours of actual design before I even opened email.",
    { hour: 12 },
  ),

  // === March 13 (Friday) — lighter day ===
  task("2026-03-13", "Send invoice for the logo project", "complete", { hour: 9 }),
  task("2026-03-13", "Write case study for the wayfinding project", "incomplete", {
    hour: 10,
    id: caseStudyId2,
    originId: caseStudyId1,
  }),
  task("2026-03-13", "Call Mom back", "complete", { hour: 12 }),
  note(
    "2026-03-13",
    "Had a call with a potential client who wanted a full brand for $800. Said no. Felt bad for ten minutes, then felt great.",
    { hour: 15 },
  ),
  note(
    "2026-03-13",
    "Tried that new ramen place on 5th with Emma. We both ordered the same thing without looking at each other's menus. Eight years and it still happens.",
    { hour: 20 },
  ),

  // === March 14 (Saturday) — no work tasks, personal day ===
  task("2026-03-14", "Clean the apartment", "complete", { hour: 10 }),
  task("2026-03-14", "Fix the wobbly shelf in the kitchen", "canceled", {
    hour: 11,
  }),
  note(
    "2026-03-14",
    "Skated to the coffee shop instead of biking. Forgot how much I needed that.",
    { hour: 11 },
  ),
  note(
    "2026-03-14",
    "Read something in that design principles book that stuck — 'Less, but better.' Applies to more than design.",
    { hour: 14 },
  ),

  // === March 15 (Sunday) — just one long note ===
  note(
    "2026-03-15",
    "I don't want to just be a freelancer forever. I want to make something of my own. Still don't know what. Spent the afternoon sketching loose ideas — a tool for freelancers to manage project timelines, a minimal invoicing app, a curated type specimen site. None of them feel right yet but the energy is there. Emma said I get a specific look on my face when I'm excited about something. Apparently I had it today.",
    { hour: 16 },
  ),

  // === March 16 (Monday) — back to work ===
  task("2026-03-16", "Write case study for the wayfinding project", "incomplete", {
    hour: 9,
    id: caseStudyId3,
    originId: caseStudyId2,
  }),
  task(
    "2026-03-16",
    "Sign up for that coworking membership",
    "canceled",
    { hour: 10 },
  ),
  task("2026-03-16", "Finish reading that typography article", "complete", {
    hour: 11,
  }),
  task("2026-03-16", "Cook something real for dinner (not toast)", "complete", {
    hour: 18,
  }),
  note(
    "2026-03-16",
    "Spent an hour watching a guy on YouTube explain his perfect morning routine. Ironic.",
    { hour: 22 },
  ),

  // === March 17 (Tuesday) — productive ===
  task("2026-03-17", "Sketch ideas for the rebrand project", "complete", { hour: 9 }),
  task(
    "2026-03-17",
    "Write case study for the wayfinding project",
    "complete",
    { hour: 14, id: caseStudyId4, originId: caseStudyId3 },
  ),
  task("2026-03-17", "Email final deliverables to the wayfinding client", "complete", {
    hour: 15,
  }),
  task("2026-03-17", "Run — at least 30 minutes", "complete", { hour: 7 }),
  note(
    "2026-03-17",
    "Finally finished the wayfinding case study. Only took four days of staring at it. The trick was just starting with the screenshots and letting the narrative follow.",
    { hour: 16 },
  ),
  note(
    "2026-03-17",
    "Learned the intro to that song I've been obsessing over. Fingers are wrecked but it felt like the first real break I've taken all week.",
    { hour: 21 },
  ),

  // === March 18 (Wednesday) — just tasks, busy day ===
  task("2026-03-18", "Client call for the rebrand — 10am", "complete", {
    hour: 10,
  }),
  task("2026-03-18", "Revise moodboard based on call feedback", "complete", {
    hour: 13,
  }),
  task("2026-03-18", "Update portfolio case study", "incomplete", { hour: 16 }),
  task("2026-03-18", "Pick up prescription", "complete", { hour: 17 }),

  // === March 19 (Thursday) ===
  task("2026-03-19", "Push portfolio v2 staging build", "complete", {
    hour: 9,
  }),
  task("2026-03-19", "Dinner with Emma — try that Thai place", "complete", {
    hour: 18,
  }),
  note(
    "2026-03-19",
    "Emma made a point tonight about how I never actually close the laptop, I just move to the couch with it. She's right. Need to be better about shutting it down when the workday ends.",
    { hour: 21 },
  ),

  // === March 20 (Friday) ===
  task("2026-03-20", "Send moodboard round 2 for the rebrand", "complete", { hour: 10 }),
  task("2026-03-20", "Fix portfolio mobile nav bug", "complete", { hour: 14 }),
  task("2026-03-20", "Return library books", "incomplete", { hour: 16 }),
  note(
    "2026-03-20",
    "Lena called — she's thinking about dropping her major. Told her to do what scares her. Realized I should take my own advice.",
    { hour: 18 },
  ),

  // === March 21 (Saturday) — personal ===
  task("2026-03-21", "Farmer's market with Emma", "complete", { hour: 9 }),
  task("2026-03-21", "Skate session at the park", "complete", { hour: 14 }),
  note(
    "2026-03-21",
    "No screens until noon. It's embarrassing that this feels like an achievement. Made shakshuka from the market eggs — turned out better than expected.",
    { hour: 13 },
  ),

  // === March 22 (Sunday) — off ===
  task("2026-03-22", "Laundry", "complete", { hour: 10 }),
  task("2026-03-22", "Return library books", "complete", { hour: 11 }),
  note(
    "2026-03-22",
    "Noodled on guitar for an hour. Tried to play that song by ear. Got about 60% of it. Good enough for a Sunday.",
    { hour: 15 },
  ),
  note(
    "2026-03-22",
    "Made pasta from scratch with Emma. Huge mess, mediocre results, great time. She wants to try gnocchi next weekend.",
    { hour: 19 },
  ),

  // === March 23 (Monday) — heavy work day ===
  task("2026-03-23", "Rebrand — wordmark explorations", "complete", {
    hour: 8,
  }),
  task("2026-03-23", "Reply to logo client feedback", "complete", {
    hour: 11,
  }),
  task("2026-03-23", "Update portfolio case study", "incomplete", {
    hour: 14,
  }),
  task("2026-03-23", "Run — try that new route by the river", "complete", {
    hour: 7,
  }),
  note(
    "2026-03-23",
    "Four solid hours of type work this morning. The wordmark is getting close — something between geometric and humanist. Feels like it has a voice now.",
    { hour: 12 },
  ),

  // === March 24 (Tuesday) ===
  task("2026-03-24", "Wordmark — refine top 3 directions", "complete", {
    hour: 9,
  }),
  task("2026-03-24", "Sketch ideas for rebrand color palette", "incomplete", {
    hour: 13,
  }),
  task("2026-03-24", "Text Dad — his birthday is Friday", "complete", {
    hour: 12,
  }),
  note(
    "2026-03-24",
    "The gap between where I am and where I want to be feels smaller this week. Not sure if I'm actually getting closer or just getting better at not thinking about it.",
    { hour: 22 },
  ),

  // === March 25 (Wednesday) ===
  task("2026-03-25", "Present wordmark to client", "complete", {
    hour: 10,
  }),
  task("2026-03-25", "Start color palette exploration", "complete", {
    hour: 14,
  }),
  task("2026-03-25", "Order Dad's birthday gift", "complete", { hour: 13 }),
  note(
    "2026-03-25",
    "Client loved the wordmark. First option, no revisions. That almost never happens. Trying not to let it go to my head.",
    { hour: 11 },
  ),
  note(
    "2026-03-25",
    "Skated around the neighborhood after work. The weather is starting to turn. Spring energy.",
    { hour: 18 },
  ),

  // === March 26 (Thursday — today) ===
  task("2026-03-26", "Update portfolio case study", "incomplete", { hour: 9 }),
  task("2026-03-26", "Sketch ideas for rebrand color palette", "incomplete", {
    hour: 10,
  }),
  task("2026-03-26", "Book dinner for Dad's birthday", "incomplete", {
    hour: 11,
  }),
  note(
    "2026-03-26",
    "Two weeks into the new routine and it's mostly holding. The mornings are sacred now. If I protect those, everything else falls into place.",
    { hour: 12 },
  ),

  // === Pinned notes (no specific day — use March 12 as anchor) ===
  note("2026-03-12", "Floor rate: $75/hr. No exceptions, no guilt.", {
    hour: 8,
    pinned: true,
  }),
  note(
    "2026-03-12",
    "Morning = design. Afternoon = admin. Protect the morning.",
    { hour: 8, pinned: true },
  ),
];

const dump: DatabaseDump = {
  entries,
  schema_version: 1,
};

const outPath = join(import.meta.dir, "..", "seed-data.json");
writeFileSync(outPath, JSON.stringify(dump, null, 2));
console.log(`Wrote ${entries.length} entries to seed-data.json`);
