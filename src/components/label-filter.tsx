import { Select } from "@base-ui/react/select";
import { useStore } from "@nanostores/react";
import { CheckIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { useLabels } from "@/hooks/use-labels";
import { $labelFilter } from "@/stores/entry-search";
import { Button } from "./button";

export function LabelFilter() {
  const selected = useStore($labelFilter);
  const labels = useLabels();

  return (
    <Select.Root
      value={selected?.id ?? null}
      onValueChange={(id) => {
        if (id === null) return $labelFilter.set(null);
        const label = labels.find((l) => l.id === id);
        if (label) $labelFilter.set({ id: label.id, name: label.name });
      }}
    >
      <Select.Trigger render={<Button variant="outline" radius="outermost" />}>
        <FunnelSimpleIcon />
        {selected && <span>{selected.name}</span>}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner side="bottom" align="end" sideOffset={8}>
          <Select.Popup className="min-w-40 max-h-96 overflow-y-auto bg-neutral-800 outline outline-neutral-700 rounded-xl p-1 shadow-lg">
            <LabelItem value={null} name="All labels" />
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
