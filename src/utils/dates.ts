export function toLocalISO(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00`));
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function formatWeekdayShort(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function formatMonthYear(iso: string): { month: string; year: string } {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return {
    month: new Intl.DateTimeFormat("en-US", { month: "long" }).format(date),
    year: new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date),
  };
}

export function formatDayWeekday(iso: string): { day: number; weekday: string } {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  return { day: date.getDate(), weekday };
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function relativeDate(iso: string, today: string): string {
  const taskDate = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const todayDate = new Date(`${today.slice(0, 10)}T00:00:00`);
  const days = Math.round((todayDate.getTime() - taskDate.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days === 2) return "Two days ago";
  if (days < 7) return "A few days ago";
  if (days < 14) return "Last week";
  if (days < 21) return "Two weeks ago";
  if (days < 28) return "Three weeks ago";
  if (days < 60) return "Last month";
  return "Over a month ago";
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
