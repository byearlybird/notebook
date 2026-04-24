import { persistentAtom } from "@nanostores/persistent";

export const ACCENT_COLORS = ["yellow", "orange", "rose", "violet", "sky", "emerald"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export type Theme = "light" | "dark" | "system";

export type UserSettings = {
  onboarded: boolean;
  accent: AccentColor;
  theme: Theme;
};

export const $userSettings = persistentAtom<UserSettings>(
  "userSettings",
  {
    onboarded: false,
    accent: "yellow",
    theme: "system",
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);
