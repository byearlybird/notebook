import { DotsThreeIcon } from "@phosphor-icons/react";
import { Menu } from "@base-ui/react/menu";
import { cx } from "cva";
import type { ComponentProps, ReactNode } from "react";

export const MenuRoot = Menu.Root;

export function MenuButton({ className, ...props }: ComponentProps<typeof Menu.Trigger>) {
  return (
    <Menu.Trigger
      className={cx(
        "flex items-center justify-center  shrink-0 rounded-md transition-transform active:scale-105",
        className,
      )}
      {...props}
    >
      <DotsThreeIcon className="size-4" />
    </Menu.Trigger>
  );
}

export function MenuItem({
  variant = "default",
  className,
  ...props
}: ComponentProps<typeof Menu.Item> & { variant?: "default" | "destructive" }) {
  return (
    <Menu.Item
      className={cx(
        "flex gap-2 items-center px-3 py-2 rounded-sm text-sm cursor-default outline-none data-highlighted:bg-slate-medium",
        variant === "destructive" && "text-error",
        className,
      )}
      {...props}
    />
  );
}

export function MenuContent({ children }: { children: ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner className="z-50" sideOffset={8}>
        <Menu.Popup className="bg-slate-dark text-ivory-dark rounded-md p-1 shadow border border-slate-light origin-(--transform-origin) transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}
