import type { ReactElement } from "react";
import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "@/hooks/use-db-query";
import { formatDateTime } from "@/utils/dates";
import { openEntryDetail } from "@/stores/entry-detail";
import { SidebarPopover } from "@/components/shared/sidebar-popover";

type TimelineView = DBSchema["timeline"];

export function PinnedNotesPreview({ children }: { children: ReactElement }) {
  const pinned = useDBQuery((db) =>
    db.selectFrom("timeline").selectAll().where("pinned", "=", 1).orderBy("created_at", "desc"),
  ) as TimelineView[] | undefined;

  return (
    <SidebarPopover trigger={children}>
      {pinned && pinned.length > 0 ? (
        pinned.map((note) => <PinnedRow key={note.id} note={note} />)
      ) : (
        <div className="px-2 py-3 text-sm text-foreground-muted">No pinned notes</div>
      )}
    </SidebarPopover>
  );
}

function PinnedRow({ note }: { note: TimelineView }) {
  return (
    <button
      onClick={() => openEntryDetail(note.id)}
      className="w-full text-left rounded-lg px-2 py-2 hover:bg-surface-tint transition-colors"
    >
      <div className="text-xs text-foreground-muted mb-0.5">{formatDateTime(note.created_at)}</div>
      <div className="text-sm text-foreground line-clamp-2">{note.content}</div>
    </button>
  );
}
