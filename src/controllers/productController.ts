import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/productService.js";
import { parseOrThrow } from "../validation/parseRequest.js";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../validation/productSchemas.js";
import { pathId } from "../http/pathId.js";

/** POST /products -- topico 1.1 (insertOne) */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    // Validacao ANTES de qualquer coisa. O que segue e `input`, tipado, e nunca
    // mais `req.body`.
    const input = parseOrThrow(createProductSchema, req.body, "Payload invalido.");

    const product = await productService.createProduct(input);

    return res.success(product);
  } catch (err) {
    next(err);
  }
}

/** GET /products -- find sem filtro, igualdade e limit */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const query = parseOrThrow(
      listProductsQuerySchema,
      req.query,
      "Parametros de consulta invalidos.",
    );

    const products = await productService.listProducts(query);


    return res.success(products, { limit: query.limit });
  } catch (err) {
    next(err);
  }
}

/** GET /products/:id -- findOne por ObjectId */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    // A validacao do formato e a conversao para ObjectId acontecem no service,
    // que lanca 400 (formato invalido) ou 404 (id valido, documento ausente).
    const product = await productService.getProductById(pathId(req));
    return res.success(product);
  } catch (err) {
    next(err);
  }
}

/** PATCH /products/:id -- updateOne com $set */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {

    const input = parseOrThrow(updateProductSchema, req.body, "Payload invalido.");

    const result = await productService.updateProduct(pathId(req), input);

    return res.success(result.product, { matched: result.matched, modified: result.modified });
  } catch (err) {
    next(err);
  }
}

/** DELETE /products/:id -- deleteOne */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    await productService.deleteProduct(pathId(req));

    return res.success();
  } catch (err) {
    next(err);
  }
}
