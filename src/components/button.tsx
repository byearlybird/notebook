import { clsx } from "clsx";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "outline";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "[&>svg]:size-4 min-h-9 flex gap-2 items-center rounded-2xl px-2.5 transition-all active:scale-105 py-1.5",
        variant === "primary" && "bg-yellow-400 hover:bg-yellow-300 text-yellow-950",
        variant === "secondary" && "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
        variant === "outline" && "border border-neutral-700 hover:bg-neutral-100/10 text-white/70",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
