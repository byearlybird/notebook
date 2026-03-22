import { WarningCircleIcon } from "@phosphor-icons/react";

export function ErrorComponent() {
  return (
    <div className="flex size-full items-center justify-center gap-2">
      <WarningCircleIcon className="size-6 text-error" />
      <span className="sr-only">Error</span>
    </div>
  );
}
