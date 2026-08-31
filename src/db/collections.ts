import type { Collection, Db } from "mongodb";
import { getDb } from "./mongo.js";
import type { ProductDocument } from "../types/product.js";
import type { UserDocument } from "../types/user.js";
import type { CartDocument } from "../types/cart.js";

export const COLLECTIONS = {
  products: "products",
  users: "users",
  carts: "carts",
} as const;

export const productsCollection = (db: Db = getDb()): Collection<ProductDocument> =>
  db.collection<ProductDocument>(COLLECTIONS.products);

export const usersCollection = (db: Db = getDb()): Collection<UserDocument> =>
  db.collection<UserDocument>(COLLECTIONS.users);

export const cartsCollection = (db: Db = getDb()): Collection<CartDocument> =>
  db.collection<CartDocument>(COLLECTIONS.carts);
