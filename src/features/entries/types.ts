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

export type TimelineItem = NoteTimelineItem | TaskTimelineItem;
