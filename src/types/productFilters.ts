import type { NewProductDocument } from "./product.js";

export interface ProductQueryCriteria {
  category?: string;
  available?: boolean;
}

/** Campos aceitos numa atualizacao parcial. */
export type ProductUpdateFields = {
  [K in keyof Omit<NewProductDocument, "createdAt" | "updatedAt">]?:
    | NewProductDocument[K]
    | undefined;
};
