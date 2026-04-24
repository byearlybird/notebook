import { createFileRoute } from "@tanstack/react-router";
import { AccentPicker } from "@/components/accent-picker";
import { ThemePicker } from "@/components/theme-picker";

export const Route = createFileRoute("/settings/theme")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-8 max-w-sm">
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Appearance</h2>
          <p className="text-sm text-foreground-muted mt-1">Choose between light and dark mode.</p>
        </div>
        <ThemePicker />
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Accent color</h2>
          <p className="text-sm text-foreground-muted mt-1">
            Choose the accent used for primary buttons, highlights, and status indicators.
          </p>
        </div>
        <AccentPicker />
      </div>
    </div>
  );
}
