import { useEffect, useRef } from "react";
import type { Compilable, Kysely } from "kysely";
import { useReactiveQuery } from "sqlocal/react";
import { sqlocal, db } from "@/db/client";
import type { DBSchema } from "@/db/schema";

export function useDBQuery<T>(build: (db: Kysely<DBSchema>) => Compilable<T>): T[] | undefined {
  const compiled = build(db).compile();
  const { data, setQuery } = useReactiveQuery(sqlocal, compiled);

  const queryKey = compiled.sql + JSON.stringify(compiled.parameters);
  const prevKey = useRef(queryKey);

  useEffect(() => {
    if (prevKey.current === queryKey) return;
    prevKey.current = queryKey;
    setQuery(compiled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return data as T[] | undefined;
}
