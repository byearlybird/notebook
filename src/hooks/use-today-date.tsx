import { useEffect, useState } from "react";

function toDateString(date: Date) {
  return date.toLocaleDateString("en-CA");
}

export function useTodayDate() {
  const [date, setDate] = useState(() => toDateString(new Date()));

  useEffect(() => {
    const interval = setInterval(
      () => {
        const current = toDateString(new Date());
        if (current !== date) setDate(current);
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [date]);

  return date;
}
