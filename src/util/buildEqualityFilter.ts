import type { Document, Filter } from "mongodb";

export function buildEqualityFilter<T extends Document>(
  criteria: { readonly [K in keyof T]?: T[K] },
): Filter<T> {
  const filter: Filter<T> = {};
  for (const [key, value] of Object.entries(criteria)) {
    if (value !== undefined) {
      (filter as Record<string, unknown>)[key] = value;
    }
  }
  return filter;
}