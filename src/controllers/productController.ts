import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/productService.js";
import { badRequest } from "../errors/AppError.js";
import { createProductSchema, listProductsQuerySchema } from "../validation/productSchemas.js";


/** POST /products -- Criar um novo produto */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    // Validacao ANTES de qualquer coisa. O que segue e `data`, tipado, e nunca mais `req.body`.
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(
        "Payload invalido.",
        parsed.error.issues.map((i) => ({ path: i.path.join(".") || "(raiz)", message: i.message })),
      );
    }

    const product = await productService.createProduct(parsed.data);

    return res.success(product);
  } catch (err) {
    next(err);
  }
}

/** GET /products -- Listar todos os produtos */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    // Validacao ANTES de qualquer coisa. O que segue e `data`, tipado, e nunca mais `req.query`.
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw badRequest(
        "Parametros de consulta invalidos.",
        parsed.error.issues.map((i) => ({ path: i.path.join(".") || "(raiz)", message: i.message })),
      );
    }

    const products = await productService.listProducts(parsed.data);

    return res.success(products, { limit: parsed.data.limit });
  } catch (err) {
    next(err);
  }
}

/** GET /products/:id -- Buscar um produto por ID */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
  
    const raw = req.params.id;
    const id = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

    const product = await productService.getProductById(id);
    return res.success(product);
  } catch (err) {
    next(err);
  }
}
