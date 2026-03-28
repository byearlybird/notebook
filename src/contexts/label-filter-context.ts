import { createContext } from "react";

export const LabelFilterContext = createContext<[string | null, (id: string | null) => void]>([
  null,
  () => {},
]);
