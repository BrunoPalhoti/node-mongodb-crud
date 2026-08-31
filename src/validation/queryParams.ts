import { z } from "zod";
import { env } from "../config/env.js";

export const booleanFromQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true");


export const limitFromQuery = z
  .string()
  .regex(/^\d+$/, "limit deve ser um numero inteiro")
  .transform(Number)
  .refine((n) => n >= 1 && n <= env.maxLimit, {
    message: `limit deve estar entre 1 e ${env.maxLimit}`,
  });


export const limitWithDefault = limitFromQuery.default(env.defaultLimit);
