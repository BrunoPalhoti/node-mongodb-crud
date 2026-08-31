import type { Request } from "express";

/**
 * Os tipos do Express declaram params como `string | string[]`, porque uma rota
 * pode repetir o mesmo nome de parametro. Aqui nao pode, mas normalizamos para
 * nunca passar um array adiante como se fosse id.
 */
export function pathId(req: Request): string {
  const raw = req.params.id;
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
}
