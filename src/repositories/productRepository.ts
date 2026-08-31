import type { Filter, ObjectId } from "mongodb";
import { productsCollection } from "../db/collections.js";
import type { NewProductDocument, ProductDocument } from "../types/product.js";


export interface ProductQueryCriteria {
  category?: string;
  available?: boolean;
}

function buildFilter(criteria: ProductQueryCriteria): Filter<ProductDocument> {
  const filter: Filter<ProductDocument> = {};

  /** Cada campo presente vira mais uma condicao. Varias chaves no mesmo objeto
   * sao combinadas com E logico: category E available precisam bater.
   */
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

/** Resultado bruto do updateOne, sem interpretacao: quem decide e o service. */
export interface UpdateOutcome {
  matched: number;
  modified: number;
}

/** Campos aceitos numa atualizacao parcial.*/
export type ProductUpdateFields = {
  [K in keyof Omit<NewProductDocument, "createdAt" | "updatedAt">]?:
    | NewProductDocument[K]
    | undefined;
};

/** updateOne() com $set */
export async function updateProductById(
  id: ObjectId,
  fields: ProductUpdateFields,
): Promise<UpdateOutcome> {
  /** Descartar chaves com `undefined` antes de montar o $set. */
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

/** deleteOne() com _id */
export async function deleteProductById(id: ObjectId): Promise<number> {
  const result = await productsCollection().deleteOne({ _id: id });
  return result.deletedCount;
}
