import type { Task } from "@/db";

type BaseTimelineItem = {
  id: string;
  content: string;
  created_at: string;
};

type NoteTimelineItem = BaseTimelineItem & {
  type: "note";
};

type TaskTimelineItem = BaseTimelineItem & {
  type: "task";
  status: Task["status"];
};

type IntentionTimelineItem = BaseTimelineItem & {
  type: "intention";
};

type GoalTimelineItem = BaseTimelineItem & {
  type: "goal";
  status: "incomplete" | "complete";
};

export type TimelineItem =
  | NoteTimelineItem
  | TaskTimelineItem
  | IntentionTimelineItem
  | GoalTimelineItem;
