import type { Db } from "mongodb";
import { cartsCollection, productsCollection, usersCollection } from "./collections.js";

export async function ensureIndexes(db: Db): Promise<string[]> {
  const created: string[] = [];


  const partialUniqueExternalId = {
    unique: true,
    partialFilterExpression: { externalId: { $exists: true } },
    name: "externalId_unique_partial",
  } as const;

  created.push(await productsCollection(db).createIndex({ externalId: 1 }, partialUniqueExternalId));
  created.push(await usersCollection(db).createIndex({ externalId: 1 }, partialUniqueExternalId));
  created.push(await cartsCollection(db).createIndex({ externalId: 1 }, partialUniqueExternalId));


  created.push(await productsCollection(db).createIndex({ category: 1, price: 1 }, { name: "category_price" }));

  created.push(await productsCollection(db).createIndex({ price: 1 }, { name: "price" }));

  
  created.push(await productsCollection(db).createIndex({ "rating.rate": -1 }, { name: "rating_rate_desc" }));

  created.push(await usersCollection(db).createIndex({ email: 1 }, { unique: true, name: "email_unique" }));
  created.push(await usersCollection(db).createIndex({ username: 1 }, { unique: true, name: "username_unique" }));

  created.push(await cartsCollection(db).createIndex({ userId: 1, date: -1 }, { name: "userId_date" }));

  return created;
}
