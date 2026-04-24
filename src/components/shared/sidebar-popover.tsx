import { Popover } from "@base-ui/react/popover";
import type { ReactElement, ReactNode } from "react";

export function SidebarPopover({
  trigger,
  children,
}: {
  trigger: ReactElement;
  children: ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={150} closeDelay={150} render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side="right" align="start" sideOffset={8}>
          <Popover.Popup className="w-80 max-h-96 overflow-y-auto bg-background outline outline-border rounded-xl p-2 shadow-lg origin-left data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
