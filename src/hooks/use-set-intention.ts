import { useTodayDate } from "./use-today-date";
import { intentionService } from "@/services/intention-service";

export function useSetIntention() {
  const today = useTodayDate();
  const month = today.slice(0, 7);

  return function setIntention() {
    const content = window.prompt("What's your intention for this month?");
    if (content?.trim()) {
      intentionService.createIntention(content.trim(), month);
    }
  };
}
