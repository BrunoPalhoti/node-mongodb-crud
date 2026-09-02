import type { ObjectId } from "mongodb";
import { cartsCollection } from "../../db/collections.js";

export async function countCartsWithProduct(productId: ObjectId): Promise<number> {
  return cartsCollection().countDocuments({ "items.productId": productId });
}
