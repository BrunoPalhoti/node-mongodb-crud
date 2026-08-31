import { z } from "zod";
import { env } from "../config/env.js";

/**
 * A FRONTEIRA entre o mundo externo (HTTP) e o banco.
 *
 * Regra que vale para todo o projeto: `req.body` e `req.query` NUNCA chegam ao
 * MongoDB. Isso e o que mantem o banco concentrado no repository.
 */

const finite = z.number().refine((n) => Number.isFinite(n), {
  message: "deve ser um numero finito (nao NaN nem Infinity)",
});

export const createProductSchema = z
  .object({
    title: z.string().trim().min(1, "title e obrigatorio").max(300),
    price: finite.refine((n) => n >= 0, { message: "price nao pode ser negativo" }),
    description: z.string().max(5000).default(""),
    category: z.string().trim().min(1, "category e obrigatoria").max(100),
    image: z
      .string()
      .trim()
      .refine((s) => s.startsWith("http://") || s.startsWith("https://"), {
        message: "image deve ser uma URL http(s)",
      }),
    rating: z
      .object({
        rate: finite.refine((n) => n >= 0 && n <= 5, { message: "rate deve estar entre 0 e 5" }),
        count: z
          .number()
          .refine((n) => Number.isInteger(n) && n >= 0, { message: "count deve ser inteiro >= 0" }),
      })
      .default({ rate: 0, count: 0 }),
    available: z.boolean().default(true),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * BOOLEANO VINDO DA QUERY STRING
 * Booleans são convertidos para booleanos no JavaScript.
 */
const booleanFromQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

/**
 * LIMITE DE RETORNO -- validacao com regex antes de converter: `Number("abc")` seria NaN, e
 * `limit(NaN)` produziria um erro obscuro vindo do driver. Uma listagem sem limite carrega a collection inteira na memoria do processo
 * e joga tudo na resposta. Com 20 produtos e inofensivo; com 200 mil, derruba
 * o servidor. Por isso ha um padrao (DEFAULT_LIMIT) e um teto (MAX_LIMIT).
 */
const limitFromQuery = z
  .string()
  .regex(/^\d+$/, "limit deve ser um numero inteiro")
  .transform(Number)
  .refine((n) => n >= 1 && n <= env.maxLimit, {
    message: `limit deve estar entre 1 e ${env.maxLimit}`,
  });

/**
 * LISTAGEM -- sem filtro e filtro de igualdade
 *
 * Todos os parametros sao opcionais: sem nenhum deles, a consulta e um `find`
 * sem filtro. `.strict()` de novo, para que `?categoria=x` (em portugues, por
 * engano) avise o cliente em vez de ser ignorado em silencio.
 */
export const listProductsQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    available: booleanFromQuery.optional(),
    limit: limitFromQuery.default(env.defaultLimit),
  })
  .strict();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
