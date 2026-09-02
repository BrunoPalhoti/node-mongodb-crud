import type { NewProductDocument } from "./product.js";

export interface ProductQueryCriteria {
  category?: string;
  available?: boolean;
}

/** Patch persistido no `$set`: sem `undefined` e com `updatedAt`. */
export type ProductPatch = {
  [K in keyof Omit<NewProductDocument, "createdAt" | "externalId" | "updatedAt">]?: NewProductDocument[K];
} & { updatedAt: Date };
