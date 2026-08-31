import type { ObjectId } from "mongodb";
import { cartsCollection } from "../db/collections.js";

/**
 * REPOSITORY de carrinhos.
 */

export async function countCartsWithProduct(productId: ObjectId): Promise<number> {
  return cartsCollection().countDocuments({ "items.productId": productId });
}
