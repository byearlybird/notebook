import { clsx } from "clsx";
import { Button as BaseButton } from "@base-ui/react";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  radius?: "outermost" | "inner";
};

export function Button({
  children,
  className,
  variant = "primary",
  radius = "inner",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(
        "[&>svg]:size-4 min-h-9 flex gap-2 items-center rounded-2xl px-2.5 transition-all active:scale-105 py-1.5 cursor-default",
        variant === "primary" && "bg-yellow-400 hover:bg-yellow-300 text-yellow-950",
        variant === "secondary" && "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
        variant === "outline" &&
          "outline outline-neutral-700 hover:bg-neutral-100/10 text-white/70",
        variant === "ghost" && "hover:bg-neutral-100/10 text-white/70",
        radius === "outermost" && "rounded-2xl",
        radius === "inner" && "rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
