import { SpinnerIcon } from "@phosphor-icons/react";

export function Loading() {
  return (
    <div className="flex size-full items-center justify-center gap-2">
      <SpinnerIcon className="size-6 animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
