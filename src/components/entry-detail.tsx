import { Drawer } from "@base-ui/react/drawer";
import { XIcon } from "@phosphor-icons/react";
import type { DBSchema } from "../db/schema";
import { formatDateTime } from "../utils/dates";

type TimelineView = DBSchema["timeline"];

type EntryDetailProps = {
  entry: TimelineView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EntryDetail({ entry, open, onOpenChange }: EntryDetailProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
        <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-end">
          <Drawer.Popup className="relative max-w-full sm:min-w-lg h-full bg-neutral-800 outline outline-neutral-700 transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
            <Drawer.Close className="absolute top-4 right-4 p-1 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50 transition-colors cursor-pointer">
              <XIcon className="size-4" />
            </Drawer.Close>
            <Drawer.Content className="p-6 h-full flex flex-col">
              {entry && (
                <>
                  <Drawer.Title className="text-lg font-semibold font-serif mb-1">
                    {entry.type === "task" ? "Task" : "Note"}
                  </Drawer.Title>
                  <p className="text-xs text-neutral-400 mb-4">
                    {formatDateTime(entry.created_at)}
                  </p>
                  <p className="text-neutral-200">{entry.content}</p>
                </>
              )}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
