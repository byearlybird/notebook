import { Select } from "@base-ui/react/select";
import { CheckIcon, TagSimpleIcon } from "@phosphor-icons/react";
import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "@/hooks/use-db-query";
import { labelsService } from "@/services/label-service";
import { Button } from "./button";

type TimelineView = DBSchema["timeline"];
type LabelRow = { id: string; name: string };
type LabeledRow = { label: string | null };

export function LabelPicker({ entry }: { entry: TimelineView }) {
  const labels = useDBQuery((db) =>
    db
      .selectFrom("labels")
      .select(["id", "name"])
      .where("is_deleted", "=", 0)
      .orderBy("name", "asc"),
  ) as LabelRow[] | undefined;

  const rows = useDBQuery((db) =>
    entry.type === "note"
      ? db.selectFrom("notes").select("label").where("id", "=", entry.id)
      : db.selectFrom("tasks").select("label").where("id", "=", entry.id),
  ) as LabeledRow[] | undefined;

  const currentLabelId = rows?.[0]?.label ?? null;
  const currentLabelName = labels?.find((l) => l.id === currentLabelId)?.name;

  return (
    <Select.Root
      value={currentLabelId}
      onValueChange={(value) => {
        labelsService.setEntryLabel(entry.type, entry.id, value as string | null);
      }}
    >
      <Select.Trigger render={<Button variant="outline" radius="inner" />}>
        <TagSimpleIcon />
        {currentLabelName && <span>{currentLabelName}</span>}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner side="bottom" align="end" sideOffset={8}>
          <Select.Popup className="min-w-40 max-h-96 overflow-y-auto bg-neutral-800 outline outline-neutral-700 rounded-xl p-1 shadow-lg">
            <LabelItem value={null} name="None" />
            {labels?.map((label) => (
              <LabelItem key={label.id} value={label.id} name={label.name} />
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function LabelItem({ value, name }: { value: string | null; name: string }) {
  return (
    <Select.Item
      value={value}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-200 cursor-default data-highlighted:bg-neutral-700/60"
    >
      <Select.ItemText>{name}</Select.ItemText>
      <Select.ItemIndicator>
        <CheckIcon className="size-4" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}
