import type { ObjectId } from "mongodb";
import { productsCollection } from "../../db/collections.js";
import type { NewProductDocument, ProductDocument } from "../../types/product.js";
import type { ProductPatch, ProductQueryCriteria } from "../../types/productFilters.js";
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
  fields: ProductPatch,
): Promise<ProductDocument | null> {
  return productsCollection().findOneAndUpdate(
    { _id: id },
    { $set: fields },
    { returnDocument: "after" },
  );
}

export async function deleteProductById(id: ObjectId): Promise<number> {
  const result = await productsCollection().deleteOne({ _id: id });
  return result.deletedCount;
}
