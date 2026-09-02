import { conflict, notFound } from "../../errors/AppError.js";
import * as productRepository from "../../repositories/products/productRepository.js";
import type { ProductDocument } from "../../types/product.js";
import { omitUndefined } from "../../util/omitUndefined.js";
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

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ProductDocument> {
  const objectId = toObjectId(id);
  const product = await productRepository.updateProductById(objectId, {
    ...omitUndefined(input),
    updatedAt: new Date(),
  });

  if (!product) throw notFound(`Produto ${id} nao encontrado.`);

  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const objectId = toObjectId(id);

  const usage = await productInCartDeletionGuard.inspect(objectId);
  if (!usage.canDelete) {
    throw conflict(
      `Produto ${id} nao pode ser excluido: esta referenciado em ${usage.cartCount} carrinho(s).`,
      {
        cartsReferencing: usage.cartCount,
        hint: 'Para tirar de circulacao preservando o historico: PATCH /products/<id> { "available": false }',
      },
    );
  }

  const deletedCount = await productRepository.deleteProductById(objectId);
  if (deletedCount === 0) throw notFound(`Produto ${id} nao encontrado.`);
}
