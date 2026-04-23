import { useEffect, useRef, useState } from "react";
import type { Compilable, Kysely } from "kysely";
import { useReactiveQuery } from "sqlocal/react";
import { sqlocal, db } from "@/db/client";
import type { DBSchema } from "@/db/schema";

export function useDBQuery<T>(build: (db: Kysely<DBSchema>) => Compilable<T>): T[] | undefined {
  const compiled = build(db).compile();
  const { data, status, setQuery } = useReactiveQuery(sqlocal, compiled);

  const queryKey = compiled.sql + JSON.stringify(compiled.parameters);
  const prevKey = useRef(queryKey);
  const trustOk = useRef(true);
  const [cachedData, setCachedData] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    if (prevKey.current === queryKey) return;
    prevKey.current = queryKey;
    trustOk.current = false;
    setQuery(compiled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    if (status === "pending") trustOk.current = true;
    else if (status === "ok" && trustOk.current) setCachedData(data as T[]);
  }, [status, data]);

  return cachedData;
}
