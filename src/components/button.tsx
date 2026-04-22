import { clsx } from "clsx";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "flex gap-2 items-center rounded-lg px-2 transition-all active:scale-105 py-1.5",
        variant === "primary" && "bg-yellow-400 hover:bg-yellow-300 text-yellow-950",
        variant === "secondary" && "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
