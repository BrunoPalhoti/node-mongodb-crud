import type { ObjectId } from "mongodb";


export interface CartItem {
  productId: ObjectId;
  quantity: number;
}

export interface CartDocument {
  _id: ObjectId;
  externalId?: number;
  userId: ObjectId;
  date: Date;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type NewCartDocument = Omit<CartDocument, "_id">;
