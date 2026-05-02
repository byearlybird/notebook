const STOPS: { pos: number; color: string }[] = [
  { pos: 0, color: "oklch(0.42 0.22 300)" },
  { pos: 0.5, color: "oklch(0.74 0.08 80)" },
  { pos: 0.8, color: "oklch(0.78 0.22 145)" },
  { pos: 1, color: "oklch(0.88 0.21 90)" },
];

export function moodColor(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (clamped <= b.pos) {
      const localT = (clamped - a.pos) / (b.pos - a.pos);
      const pct = Math.round(localT * 100);
      return `color-mix(in oklch, ${a.color}, ${b.color} ${pct}%)`;
    }
  }
  return STOPS[STOPS.length - 1].color;
}
