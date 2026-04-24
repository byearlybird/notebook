import { clsx } from "clsx";
import { useStore } from "@nanostores/react";
import { $userSettings, type Theme } from "@/stores/user-settings";

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function ThemePicker() {
  const settings = useStore($userSettings);
  return (
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
  );
}
