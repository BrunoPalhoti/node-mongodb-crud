import { conflict, notFound } from "../../errors/AppError.js";
import * as cartRepository from "../../repositories/carts/cartRepository.js";
import * as productRepository from "../../repositories/products/productRepository.js";
import type { ProductDocument } from "../../types/product.js";
import { toObjectId } from "../../validation/objectId.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../../validation/productSchemas.js";
import { productInCartDeletionGuard } from "../carts/productInCartDeletionGuard.js";

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
  const objectId = toObjectId(id);

  const product = await productRepository.findProductById(objectId);
  if (!product) {
 
    throw notFound(`Produto ${id} nao encontrado.`);
  }

  return product;
}

export interface UpdateProductResult {
  product: ProductDocument;
  matched: number;
  modified: number;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<UpdateProductResult> {
  const objectId = toObjectId(id);

  const outcome = await productRepository.updateProductById(objectId, input);

  /** matched = 0 significa que o filtro nao achou ninguem: o id e valido, mas o
   * documento nao existe. Nada foi criado, porque nao usamos upsert.
   */
  if (outcome.matched === 0) throw notFound(`Produto ${id} nao encontrado.`);

  const product = await productRepository.findProductById(objectId);
  if (!product) throw notFound(`Produto ${id} nao encontrado.`);

  return { product, matched: outcome.matched, modified: outcome.modified };
}

export async function deleteProduct(id: string): Promise<void> {
  const objectId = toObjectId(id);

  const cartsUsingProduct = await productInCartDeletionGuard.inspect(objectId);
  if (!cartsUsingProduct.canDelete) {
    throw conflict(
      `Produto ${id} nao pode ser excluido: esta referenciado em ${cartsUsingProduct} carrinho(s).`,
      {
        cartsReferencing: cartsUsingProduct,
        hint: 'Para tirar de circulacao preservando o historico: PATCH /products/<id> { "available": false }',
      },
    );
  }

  const deletedCount = await productRepository.deleteProductById(objectId);
  if (deletedCount === 0) throw notFound(`Produto ${id} nao encontrado.`);
}
