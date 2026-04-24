import { useState } from "react";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { labelsService } from "@/services/label-service";
import { MenuRoot, Menu, MenuTrigger, MenuItem } from "@/components/shared/menu";
import { TextareaDialog } from "@/components/shared/textarea-dialog";

type LabelRowData = { id: string; name: string; item_count: number | null };

export function LabelRow({ label }: { label: LabelRowData }) {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <li className="flex items-center gap-2 px-3 py-1">
        <span className="flex-1 flex items-baseline gap-2">
          <span>{label.name}</span>
          {!!label.item_count && (
            <span className="text-xs text-neutral-500">{label.item_count}</span>
          )}
        </span>
        <MenuRoot>
          <MenuTrigger>
            <DotsThreeVerticalIcon />
          </MenuTrigger>
          <Menu>
            <MenuItem onClick={() => setRenameOpen(true)}>Rename</MenuItem>
            <MenuItem
              variant="destructive"
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
            </MenuItem>
          </Menu>
        </MenuRoot>
      </li>
      <TextareaDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename label"
        initialValue={label.name}
        placeholder="Label name"
        size="small"
        onSave={(name) => labelsService.renameLabel(label.id, name)}
      />
    </>
  );
}
