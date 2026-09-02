import type { ObjectId } from "mongodb";
import { productsCollection } from "../../db/collections.js";
import type { NewProductDocument, ProductDocument } from "../../types/product.js";
import type { ProductQueryCriteria, ProductUpdateFields } from "../../types/productFilters.js";
import type { UpdateOutcome } from "../types.js";
import { buildEqualityFilter } from "../../util/buildEqualityFilter.js";

export async function insertProduct(document: NewProductDocument): Promise<ObjectId> {
  const result = await productsCollection().insertOne(document as ProductDocument);
  return result.insertedId;
}

export async function findProducts(
  criteria: ProductQueryCriteria,
  limit: number,
): Promise<ProductDocument[]> {
  return productsCollection().find(buildEqualityFilter(criteria)).limit(limit).toArray();
}

export async function findProductById(id: ObjectId): Promise<ProductDocument | null> {
  return productsCollection().findOne({ _id: id });
}

export async function updateProductById(
  id: ObjectId,
  fields: ProductUpdateFields,
): Promise<UpdateOutcome> {
  const changes: Record<string, unknown> = { updatedAt: new Date() };
  for (const [field, value] of Object.entries(fields)) {
    if (value !== undefined) changes[field] = value;
  }

  const result = await productsCollection().updateOne({ _id: id }, { $set: changes });

  /** matchedCount: quantos documentos o FILTRO encontrou.
   * modifiedCount: em quantos deles algo realmente mudou no disco.
   * Sao numeros diferentes: reenviar o mesmo valor da matched 1 e modified 0.
   */
  return { matched: result.matchedCount, modified: result.modifiedCount };
}

export async function deleteProductById(id: ObjectId): Promise<number> {
  const result = await productsCollection().deleteOne({ _id: id });
  return result.deletedCount;
}
