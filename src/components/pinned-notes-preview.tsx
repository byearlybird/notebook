import { Popover } from "@base-ui/react/popover";
import type { ReactElement } from "react";
import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "@/hooks/use-db-query";
import { formatDateTime } from "@/utils/dates";
import { openEntryDetail } from "@/stores/entry-detail";

type TimelineView = DBSchema["timeline"];

export function PinnedNotesPreview({ children }: { children: ReactElement }) {
  const pinned = useDBQuery((db) =>
    db.selectFrom("timeline").selectAll().where("pinned", "=", 1).orderBy("created_at", "desc"),
  ) as TimelineView[] | undefined;

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={150} closeDelay={150} render={children} />
      <Popover.Portal>
        <Popover.Positioner side="right" align="start" sideOffset={8}>
          <Popover.Popup className="w-72 max-h-96 overflow-y-auto bg-neutral-800 outline outline-neutral-700 rounded-xl p-2 shadow-lg origin-left data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
            {pinned && pinned.length > 0 ? (
              pinned.map((note) => <PinnedRow key={note.id} note={note} />)
            ) : (
              <div className="px-2 py-3 text-sm text-neutral-500">No pinned notes</div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PinnedRow({ note }: { note: TimelineView }) {
  return (
    <button
      onClick={() => openEntryDetail(note.id)}
      className="w-full text-left rounded-lg px-2 py-2 hover:bg-neutral-700/60 transition-colors"
    >
      <div className="text-xs text-neutral-400 mb-0.5">{formatDateTime(note.created_at)}</div>
      <div className="text-sm text-neutral-200 line-clamp-1">{note.content}</div>
    </button>
  );
}
