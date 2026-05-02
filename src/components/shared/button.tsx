import { clsx } from "clsx";
import { Button as BaseButton } from "@base-ui/react";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  align?: "start" | "center";
};

export function Button({
  children,
  className,
  variant = "primary",
  align = "center",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(
        "[&>svg]:size-4 min-h-9 flex gap-2 text-sm font-medium items-center rounded-xl px-2.5 transition-all active:scale-105 py-1.5 cursor-default focus:outline-1 focus:outline-accent focus:outline-offset-2",
        variant === "primary" &&
          "outline outline-accent-foreground/10 bg-accent hover:bg-accent text-accent-foreground",
        variant === "secondary" && "bg-foreground/15 text-foreground hover:bg-surface-tint",
        variant === "outline" && "outline outline-border hover:bg-surface-tint text-foreground/70",
        variant === "ghost" && "hover:bg-surface-tint text-foreground/70",
        align === "center" && "justify-center",
        align === "start" && "justify-start",
        className,
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
