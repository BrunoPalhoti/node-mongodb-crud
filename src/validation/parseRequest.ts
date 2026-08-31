import type { ZodType } from "zod";
import { badRequest } from "../errors/AppError.js";

/** Valida uma parte da requisicao (body, query, params) ou lanca 400. */
export function parseOrThrow<T>(schema: ZodType<T>, value: unknown, message: string): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw badRequest(
      message,
      parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "(raiz)",
        message: issue.message,
      })),
    );
  }

  return parsed.data;
}
