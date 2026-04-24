import { clsx } from "clsx";
import { Button as BaseButton } from "@base-ui/react";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  radius?: "outermost" | "inner";
  align?: "start" | "center";
};

export function Button({
  children,
  className,
  variant = "primary",
  radius = "inner",
  align = "center",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(
        "[&>svg]:size-4 min-h-9 flex gap-2 text-sm font-medium items-center rounded-2xl px-2.5 transition-all active:scale-105 py-1.5 cursor-default focus:outline-1 focus:outline-accent focus:outline-offset-2",
        variant === "primary" && "bg-accent hover:bg-accent text-accent-foreground",
        variant === "secondary" && "bg-foreground/15 text-foreground hover:bg-foreground/20",
        variant === "outline" &&
          "outline outline-border hover:bg-foreground/10 text-foreground/70",
        variant === "ghost" && "hover:bg-foreground/10 text-foreground/70",
        radius === "outermost" && "rounded-2xl",
        radius === "inner" && "rounded-xl",
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
