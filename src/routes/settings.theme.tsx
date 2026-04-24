import { clsx } from "clsx";
import { useStore } from "@nanostores/react";
import { createFileRoute } from "@tanstack/react-router";
import { $userSettings, ACCENT_COLORS, type AccentColor, type Theme } from "@/stores/userSettings";

export const Route = createFileRoute("/settings/theme")({
  component: RouteComponent,
});

const SWATCH_CLASS: Record<AccentColor, string> = {
  yellow: "bg-yellow-400",
  orange: "bg-orange-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
};

const LABEL: Record<AccentColor, string> = {
  yellow: "Yellow",
  orange: "Orange",
  rose: "Rose",
  violet: "Violet",
  sky: "Sky",
  emerald: "Emerald",
};

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

function RouteComponent() {
  const settings = useStore($userSettings);
  const current = settings.accent;

  const select = (accent: AccentColor) => {
    $userSettings.set({ ...settings, accent });
  };

  return (
    <div className="space-y-8 max-w-sm">
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Appearance</h2>
          <p className="text-sm text-foreground-muted mt-1">Choose between light and dark mode.</p>
        </div>
        <div className="flex gap-2">
          {THEMES.map(({ value, label }) => {
            const selected = settings.theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => $userSettings.set({ ...settings, theme: value })}
                aria-pressed={selected}
                className={clsx(
                  "flex-1 rounded-xl px-3 py-2 text-sm transition-colors cursor-default outline",
                  selected
                    ? "outline-2 outline-accent text-foreground"
                    : "outline-border text-foreground-muted hover:text-foreground hover:bg-foreground/5",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Accent color</h2>
          <p className="text-sm text-foreground-muted mt-1">
            Choose the accent used for primary buttons, highlights, and status indicators.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ACCENT_COLORS.map((color) => {
            const selected = current === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => select(color)}
                aria-pressed={selected}
                className={clsx(
                  "flex flex-col items-center gap-2 rounded-xl px-3 py-3 transition-colors cursor-default",
                  "outline outline-border hover:bg-foreground/5",
                  selected && "outline-2 outline-accent bg-foreground/5",
                )}
              >
                <span
                  className={clsx(
                    "size-8 rounded-full ring-2 ring-background",
                    SWATCH_CLASS[color],
                  )}
                />
                <span className="text-xs text-foreground">{LABEL[color]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
