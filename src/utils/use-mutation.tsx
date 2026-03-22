import { useRouter } from "@tanstack/react-router";

export function useMutation() {
  const router = useRouter();

  return async <T,>(fn: () => Promise<T>): Promise<T> => {
    const result = await fn();
    await router.invalidate();
    return result;
  }
}
