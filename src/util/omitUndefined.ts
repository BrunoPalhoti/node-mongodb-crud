/** Remove chaves cujo valor e `undefined`. O que sobra pode ir para um `$set`. */
export function omitUndefined<T extends Record<string, unknown>>(
  source: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) result[key] = value;
  }
  return result as { [K in keyof T]?: Exclude<T[K], undefined> };
}
