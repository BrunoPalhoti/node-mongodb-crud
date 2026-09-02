import type { ObjectId } from "mongodb";

export interface ProductDeletionGuard {
  inspect(productId: ObjectId): Promise<{
    canDelete: boolean;
    cartCount: number;
  }>;
}