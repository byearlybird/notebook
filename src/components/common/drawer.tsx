import { Drawer } from "@base-ui/react/drawer";
import { cx } from "cva";
import type { ComponentProps } from "react";

export function DrawerRoot(props: ComponentProps<typeof Drawer.Root>) {
  return <Drawer.Root {...props} />;
}

export const DrawerPortal = Drawer.Portal;

export function DrawerBackdrop({ className, ...props }: ComponentProps<typeof Drawer.Backdrop>) {
  return (
    <Drawer.Backdrop
      className={cx(
        "fixed inset-0 bg-slate-dark/80 transition-opacity duration-200 ease-out",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export const DrawerViewport = Drawer.Viewport;

export function DrawerPopup({ className, ...props }: ComponentProps<typeof Drawer.Popup>) {
  return (
    <Drawer.Popup
      className={cx(
        "rounded-lg border bg-slate-medium transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
        className,
      )}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof Drawer.Title>) {
  return <Drawer.Title className={cx("sr-only", className)} {...props} />;
}

export function DrawerClose({ className, ...props }: ComponentProps<typeof Drawer.Close>) {
  return <Drawer.Close className={cx("cursor-default", className)} {...props} />;
}
