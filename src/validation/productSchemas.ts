import { z } from "zod";
import { booleanFromQuery, limitWithDefault } from "./queryParams.js";

/**
 * A FRONTEIRA entre o mundo externo (HTTP) e o banco.
 *
 * Regra que vale para todo o projeto: `req.body` e `req.query` NUNCA chegam ao
 * MongoDB. Isso e o que mantem o banco concentrado no repository.
 */

const finite = z.number().refine((n) => Number.isFinite(n), {
  message: "deve ser um numero finito (nao NaN nem Infinity)",
});

/**
 * Regras de cada campo, SEM valor padrao.
 *
 * Ficam separadas porque criacao e atualizacao usam as mesmas validacoes com
 * obrigatoriedades opostas: no POST, `title` e obrigatorio e `available` nasce
 * `true`; no PATCH, tudo e opcional e um campo ausente significa "nao mexa
 * nele". Aplicar `.partial()` direto no schema de criacao nao serviria: os
 * `.default()` continuariam ativos e um PATCH `{}` gravaria `description: ""`
 * e `available: true` sobre os valores existentes.
 */
const productFields = {
  title: z.string().trim().min(1, "title e obrigatorio").max(300),
  price: finite.refine((n) => n >= 0, { message: "price nao pode ser negativo" }),
  description: z.string().max(5000),
  category: z.string().trim().min(1, "category e obrigatoria").max(100),
  image: z
    .string()
    .trim()
    .refine((s) => s.startsWith("http://") || s.startsWith("https://"), {
      message: "image deve ser uma URL http(s)",
    }),
  rating: z.object({
    rate: finite.refine((n) => n >= 0 && n <= 5, { message: "rate deve estar entre 0 e 5" }),
    count: z
      .number()
      .refine((n) => Number.isInteger(n) && n >= 0, { message: "count deve ser inteiro >= 0" }),
  }),
  available: z.boolean(),
};

export const createProductSchema = z
  .object({
    ...productFields,
    description: productFields.description.default(""),
    rating: productFields.rating.default({ rate: 0, count: 0 }),
    available: productFields.available.default(true),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** ATUALIZACAO PARCIAL -- updateOne com $set */
export const updateProductSchema = z
  .object(productFields)
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

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
    limit: limitWithDefault,
  })
  .strict();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
