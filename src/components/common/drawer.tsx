import { XIcon } from "@phosphor-icons/react";
import { Drawer } from "@base-ui/react/drawer";
import { Tabs } from "@base-ui/react/tabs";
import { cx } from "cva";
import type { ComponentProps, ReactNode } from "react";

export const DrawerRoot = Drawer.Root;

export function DrawerTrigger({ className, ...props }: ComponentProps<typeof Drawer.Trigger>) {
  return <Drawer.Trigger className={cx("cursor-default", className)} {...props} />;
}

export function DrawerContent({
  children,
  fullHeight,
}: {
  children: ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <Drawer.Portal>
      <Drawer.Backdrop className="[--backdrop-opacity:0.8] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[swiping]:duration-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute" />
      <Drawer.Viewport className="fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl justify-center">
        <Drawer.Popup
          className={cx(
            "[--bleed:2.5rem] -mb-[var(--bleed)] w-full max-w-2xl flex flex-col rounded-t-lg bg-slate-medium px-2 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] pt-3 text-ivory-light border border-slate-light border-b-0 overflow-hidden [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[swiping]:select-none data-[ending-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[starting-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            fullHeight
              ? "h-[calc(100dvh-var(--bleed))]"
              : "min-h-[70vh] max-h-[calc(80vh+var(--bleed))]",
          )}
        >
          <div className="w-12 h-1 mx-auto mb-3 rounded-full bg-slate-light" />
          {children}
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  );
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof Drawer.Title>) {
  return <Drawer.Title className={cx("sr-only", className)} {...props} />;
}

export function DrawerCloseButton() {
  return (
    <Drawer.Close className="flex size-8 ms-auto items-center justify-center rounded-full border bg-slate-medium text-ivory-light transition-transform duration-100 ease-in-out active:scale-105 [&>svg]:size-4">
      <XIcon />
    </Drawer.Close>
  );
}

export const DrawerTabRoot = Tabs.Root;

export function DrawerTabList({ children, className, ...props }: ComponentProps<typeof Tabs.List>) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-slate-medium">
      <Tabs.List className={cx("flex gap-3", className)} {...props}>
        {children}
      </Tabs.List>
      <DrawerCloseButton />
    </div>
  );
}

export function DrawerTab({ className, ...props }: ComponentProps<typeof Tabs.Tab>) {
  return (
    <Tabs.Tab
      className={cx(
        "px-2.5 py-1.5 rounded-md text-xs font-medium text-cloud-medium transition-colors data-active:bg-slate-light data-active:text-ivory-light",
        className,
      )}
      {...props}
    />
  );
}

export function DrawerTabPanel({ className, ...props }: ComponentProps<typeof Tabs.Panel>) {
  return (
    <Tabs.Panel
      className={cx(
        "flex flex-1 flex-col gap-4 overflow-y-auto p-2 px-4 focus:outline-none focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
