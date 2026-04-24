import { clsx } from "clsx";
import { useStore } from "@nanostores/react";
import { $userSettings, ACCENT_COLORS, type AccentColor } from "@/stores/user-settings";

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

export function AccentPicker() {
  const settings = useStore($userSettings);
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACCENT_COLORS.map((color) => {
        const selected = settings.accent === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => $userSettings.set({ ...settings, accent: color })}
            aria-pressed={selected}
            className={clsx(
              "flex flex-col items-center gap-2 rounded-xl px-3 py-3 transition-colors cursor-default",
              "outline outline-border hover:bg-foreground/5",
              selected && "outline-2 outline-accent bg-foreground/5",
            )}
          >
            <span
              className={clsx("size-8 rounded-full ring-2 ring-background", SWATCH_CLASS[color])}
            />
            <span className="text-xs text-foreground">{LABEL[color]}</span>
          </button>
        );
      })}
    </div>
  );
}
