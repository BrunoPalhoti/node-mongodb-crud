import type { Filter, ObjectId } from "mongodb";
import { productsCollection } from "../db/collections.js";
import type { NewProductDocument, ProductDocument } from "../types/product.js";


export interface ProductQueryCriteria {
  category?: string;
  available?: boolean;
}

function buildFilter(criteria: ProductQueryCriteria): Filter<ProductDocument> {
  const filter: Filter<ProductDocument> = {};

  // Cada campo presente vira mais uma condicao. Varias chaves no mesmo objeto
  // sao combinadas com E logico: category E available precisam bater.
  if (criteria.category !== undefined) filter.category = criteria.category;
  if (criteria.available !== undefined) filter.available = criteria.available;

  return filter;
}

export async function insertProduct(document: NewProductDocument): Promise<ObjectId> {
  const result = await productsCollection().insertOne(document as ProductDocument);
  return result.insertedId;
}

export async function findProducts(
  criteria: ProductQueryCriteria,
  limit: number,
): Promise<ProductDocument[]> {
  return productsCollection().find(buildFilter(criteria)).limit(limit).toArray();
}

export async function findProductById(id: ObjectId): Promise<ProductDocument | null> {
  return productsCollection().findOne({ _id: id });
}
