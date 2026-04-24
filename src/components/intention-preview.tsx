import { Popover } from "@base-ui/react/popover";
import type { ReactElement } from "react";
import { useMonthIntention } from "@/hooks/use-month-intention";
import { useSetIntention } from "@/hooks/use-set-intention";

export function IntentionPreview({ children }: { children: ReactElement }) {
  const intention = useMonthIntention();
  const handleSetIntention = useSetIntention();

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={150} closeDelay={150} render={children} />
      <Popover.Portal>
        <Popover.Positioner side="right" align="start" sideOffset={8}>
          <Popover.Popup className="w-72 bg-neutral-900 outline outline-neutral-800 rounded-xl p-2 shadow-lg origin-left data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
            {intention ? (
              <div className="px-2 py-2 text-sm text-neutral-200">{intention.content}</div>
            ) : (
              <button
                onClick={handleSetIntention}
                className="w-full text-left px-2 py-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Set an intention for this month +
              </button>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
