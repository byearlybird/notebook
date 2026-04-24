import { clsx } from "clsx";
import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "border border-border rounded-xl min-h-9 px-2.5 text-foreground focus:outline-1 focus:outline-accent focus:outline-offset-2",
        className,
      )}
    />
  );
}
