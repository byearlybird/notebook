import { Menu } from "@base-ui/react/menu";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { labelsService } from "@/services/label-service";
import { Button } from "./button";

type LabelRowData = { id: string; name: string; item_count: number | null };

export function LabelRow({ label }: { label: LabelRowData }) {
  return (
    <li className="flex items-center gap-2 px-3 py-1">
      <span className="flex-1 flex items-baseline gap-2">
        <span>{label.name}</span>
        {!!label.item_count && <span className="text-xs text-neutral-500">{label.item_count}</span>}
      </span>
      <Menu.Root>
        <Menu.Trigger render={<Button variant="ghost" radius="inner" />}>
          <DotsThreeIcon />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={8}>
            <Menu.Popup className="min-w-36 bg-neutral-800 outline outline-neutral-700 rounded-xl p-1 shadow-lg">
              <Menu.Item
                className="rounded-lg px-2 py-1.5 text-sm text-neutral-200 cursor-default data-highlighted:bg-neutral-700/60"
                onClick={() => {
                  const next = window.prompt("Rename label", label.name)?.trim();
                  if (next && next !== label.name) labelsService.renameLabel(label.id, next);
                }}
              >
                Rename
              </Menu.Item>
              <Menu.Item
                className="rounded-lg px-2 py-1.5 text-sm text-red-400 cursor-default data-highlighted:bg-neutral-700/60"
                onClick={() => {
                  if (label.item_count && label.item_count > 0) {
                    const ok = window.confirm(
                      `Delete "${label.name}"? It will be removed from ${label.item_count} ${
                        label.item_count === 1 ? "entry" : "entries"
                      }.`,
                    );
                    if (!ok) return;
                  }
                  labelsService.deleteLabel(label.id);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </li>
  );
}
