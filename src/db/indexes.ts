import type { CreateIndexesOptions, Db, IndexSpecification } from "mongodb";
import { COLLECTIONS } from "./collections.js";

type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

type IndexDef = {
  keys: IndexSpecification;
  options?: CreateIndexesOptions;
};

type CollectionIndexes = {
  collection: CollectionName;
  indexes: IndexDef[];
};

const partialUniqueExternalId: CreateIndexesOptions = {
  unique: true,
  partialFilterExpression: { externalId: { $exists: true } },
  name: "externalId_unique_partial",
};

const INDEXES_BY_COLLECTION: CollectionIndexes[] = [
  {
    collection: COLLECTIONS.products,
    indexes: [
      { keys: { externalId: 1 }, options: partialUniqueExternalId },
      { keys: { category: 1, price: 1 }, options: { name: "category_price" } },
      { keys: { price: 1 }, options: { name: "price" } },
      { keys: { "rating.rate": -1 }, options: { name: "rating_rate_desc" } },
    ],
  },
  {
    collection: COLLECTIONS.users,
    indexes: [
      { keys: { externalId: 1 }, options: partialUniqueExternalId },
      { keys: { email: 1 }, options: { unique: true, name: "email_unique" } },
      { keys: { username: 1 }, options: { unique: true, name: "username_unique" } },
    ],
  },
  {
    collection: COLLECTIONS.carts,
    indexes: [
      { keys: { externalId: 1 }, options: partialUniqueExternalId },
      { keys: { userId: 1, date: -1 }, options: { name: "userId_date" } },
    ],
  },
];

export async function ensureIndexes(db: Db): Promise<string[]> {
  const created: string[] = [];

  for (const { collection, indexes } of INDEXES_BY_COLLECTION) {
    for (const { keys, options } of indexes) {
      created.push(await db.collection(collection).createIndex(keys, options));
    }
  }

  return created;
}
