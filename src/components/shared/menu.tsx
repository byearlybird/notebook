import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ReactNode } from "react";
import { Button } from "@/components/button";

export const MenuRoot = BaseMenu.Root;

export function MenuTrigger({
  children,
  variant = "ghost",
}: {
  children: ReactNode;
  variant?: "ghost" | "outline";
}) {
  return (
    <BaseMenu.Trigger render={<Button variant={variant} radius="inner" />}>
      {children}
    </BaseMenu.Trigger>
  );
}

export function Menu({ children }: { children: ReactNode }) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side="bottom" align="end" sideOffset={8}>
        <BaseMenu.Popup className="min-w-36 bg-neutral-900 outline outline-neutral-800 rounded-xl p-1 shadow-lg origin-top data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <BaseMenu.Item
      className={`rounded-lg px-2 py-1.5 text-sm cursor-default data-highlighted:bg-neutral-800 ${variant === "destructive" ? "text-red-400" : "text-neutral-200"}`}
      onClick={onClick}
    >
      {children}
    </BaseMenu.Item>
  );
}
