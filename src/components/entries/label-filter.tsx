import type { Label } from "@/models";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Select } from "@base-ui/react/select";

type LabelFilterProps = {
  allLabels: Label[];
  selectedLabelId: string | null;
  onChange: (labelId: string | null) => void;
};

export function LabelFilter({ allLabels, selectedLabelId, onChange }: LabelFilterProps) {
  const active = selectedLabelId !== null;
  const selectedLabel = allLabels.find((l) => l.id === selectedLabelId) ?? null;

  return (
    <Select.Root value={selectedLabelId ?? ""} onValueChange={(val) => onChange(val || null)}>
      <Select.Trigger
        className={`flex cursor-default items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm outline-none transition-colors data-popup-open:border-cloud-dark focus-visible:border-cloud-dark ${active ? "text-ivory-dark" : "text-cloud-medium"}`}
      >
        <FunnelSimpleIcon className="size-3.5 shrink-0" />
        <Select.Value>{active ? selectedLabel?.name : "Filter"}</Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" side="bottom" align="end" sideOffset={4}>
          <Select.Popup className="origin-(--transform-origin) rounded-md border border-slate-light bg-slate-dark p-1 text-ivory-dark shadow transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
            <Select.Item
              value=""
              className="flex cursor-default items-center justify-center rounded-sm px-3 py-2 text-sm text-cloud-medium outline-none data-highlighted:bg-slate-medium data-selected:font-semibold data-selected:text-ivory-dark"
            >
              <Select.ItemText>All</Select.ItemText>
            </Select.Item>
            {allLabels.map((label) => (
              <Select.Item
                key={label.id}
                value={label.id}
                className="flex cursor-default items-center justify-center rounded-sm px-3 py-2 text-sm text-cloud-medium outline-none data-highlighted:bg-slate-medium data-selected:font-semibold data-selected:text-ivory-dark"
              >
                <Select.ItemText>{label.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
