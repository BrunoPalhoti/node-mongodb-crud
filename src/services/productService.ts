import { notFound } from "../errors/AppError.js";
import * as productRepository from "../repositories/productRepository.js";
import type { ProductDocument } from "../types/product.js";
import { toObjectId } from "../validation/objectId.js";
import type { CreateProductInput, ListProductsQuery } from "../validation/productSchemas.js";

/**
 * SERVICE -- regras da aplicacao, sem HTTP e sem MongoDB.
 */

export async function createProduct(input: CreateProductInput): Promise<ProductDocument> {
  const now = new Date();

  const document = {
    title: input.title,
    price: input.price,
    description: input.description,
    category: input.category,
    image: input.image,
    rating: input.rating,
    available: input.available,
    createdAt: now,
    updatedAt: now,
  };

  const insertedId = await productRepository.insertProduct(document);

  /**
   * O insertOne devolve so o insertedId. Montamos o documento completo com ele
   * em vez de fazer uma segunda consulta ao banco: ja temos todos os campos.
   */
  return { _id: insertedId, ...document };
}

export async function listProducts(query: ListProductsQuery): Promise<ProductDocument[]> {
  /**
   * Sem `category` nem `available`, o repository monta o filtro vazio {} e a
   * consulta vira o find sem filtro. Com um deles, vira filtro de
   * igualdade. Com os dois, as condicoes se somam com E logico.
   */
  const criteria = {
    ...(query.category !== undefined && { category: query.category }),
    ...(query.available !== undefined && { available: query.available }),
  };

  return productRepository.findProducts(criteria, query.limit);
}

export async function getProductById(id: string): Promise<ProductDocument> {
  // A conversao valida o formato e lanca 400 quando o texto nao e um ObjectId.
  const objectId = toObjectId(id);

  const product = await productRepository.findProductById(objectId);
  if (!product) {
   /**
    * Id bem formado, documento inexistente: 404. Diferente do id malformado,
    * que ja virou 400 na linha acima.
   */
    throw notFound(`Produto ${id} nao encontrado.`);
  }

  return product;
}
