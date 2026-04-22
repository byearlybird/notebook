import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Page } from "../components/page-layout";
import { EntryGroup } from "../components/entry-group";
import { EntryDetail } from "../components/entry-detail";
import type { DBSchema } from "../db/schema";

type TimelineView = DBSchema["timeline"];

const mockGroups: { date: string; entries: TimelineView[] }[] = [
  {
    date: "2026-04-22",
    entries: [
      {
        id: "1",
        type: "note",
        content: "Reviewed Q2 goals with the team",
        created_at: "2026-04-22T09:00:00Z",
      },
      {
        id: "2",
        type: "task",
        content: "Follow up with design on new onboarding flow",
        created_at: "2026-04-22T10:15:00Z",
      },
      {
        id: "3",
        type: "note",
        content: "Sync call notes: shipping delay pushed to May 3",
        created_at: "2026-04-22T11:30:00Z",
      },
      {
        id: "4",
        type: "task",
        content: "Update changelog for v0.4 release",
        created_at: "2026-04-22T13:00:00Z",
      },
    ],
  },
  {
    date: "2026-04-21",
    entries: [
      {
        id: "5",
        type: "note",
        content: "Read through the new authentication RFC",
        created_at: "2026-04-21T09:30:00Z",
      },
      {
        id: "6",
        type: "task",
        content: "Schedule 1:1 with Jordan before end of week",
        created_at: "2026-04-21T11:00:00Z",
      },
      {
        id: "7",
        type: "note",
        content: "Noticed a performance regression in the timeline query",
        created_at: "2026-04-21T14:30:00Z",
      },
    ],
  },
  {
    date: "2026-04-20",
    entries: [
      {
        id: "8",
        type: "task",
        content: "Write tests for the new sync conflict resolution logic",
        created_at: "2026-04-20T10:00:00Z",
      },
      {
        id: "9",
        type: "note",
        content: "Good conversation with Sam about the offline-first approach",
        created_at: "2026-04-20T13:20:00Z",
      },
      {
        id: "10",
        type: "task",
        content: "Review open PRs before standup tomorrow",
        created_at: "2026-04-20T16:00:00Z",
      },
    ],
  },
  {
    date: "2026-04-18",
    entries: [
      {
        id: "11",
        type: "note",
        content: "Tailwind v4 migration went smoothly — no major issues",
        created_at: "2026-04-18T09:30:00Z",
      },
      {
        id: "12",
        type: "task",
        content: "Draft copy for the empty state screens",
        created_at: "2026-04-18T11:00:00Z",
      },
      {
        id: "13",
        type: "note",
        content: "Decided to drop the intention feature from the v1 scope",
        created_at: "2026-04-18T14:45:00Z",
      },
      {
        id: "14",
        type: "task",
        content: "Clean up unused migrations before the next deploy",
        created_at: "2026-04-18T17:00:00Z",
      },
    ],
  },
];

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const [selected, setSelected] = useState<TimelineView | null>(null);

  return (
    <Page>
      {mockGroups.map((group) => (
        <EntryGroup
          key={group.date}
          date={group.date}
          entries={group.entries}
          onSelect={setSelected}
        />
      ))}
      <EntryDetail
        entry={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </Page>
  );
}
