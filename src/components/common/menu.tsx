import { Menu } from "@base-ui/react/menu";
import { cx } from "cva";
import type { ComponentProps } from "react";

export const MenuRoot = Menu.Root;

export function MenuTrigger({ className, ...props }: ComponentProps<typeof Menu.Trigger>) {
  return <Menu.Trigger className={cx("cursor-default", className)} {...props} />;
}

export const MenuPortal = Menu.Portal;

export function MenuPositioner({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Menu.Positioner>) {
  return <Menu.Positioner className={cx("z-50", className)} sideOffset={sideOffset} {...props} />;
}

export function MenuPopup({ className, ...props }: ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Popup
      className={cx(
        "bg-slate-dark text-ivory-dark rounded-md p-1 shadow border border-slate-light",
        "origin-(--transform-origin) transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function MenuItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cx(
        "flex items-center px-3 py-2 rounded-sm text-sm cursor-default outline-none data-highlighted:bg-slate-medium",
        className,
      )}
      {...props}
    />
  );
}

export function MenuSeparator({ className, ...props }: ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cx("h-px bg-slate-medium my-1", className)} {...props} />;
}
