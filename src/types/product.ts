import type { ObjectId } from "mongodb";

export interface ProductRating {
  rate: number;
  count: number;
}

export interface ProductDocument {
  _id: ObjectId;
  externalId?: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewProductDocument = Omit<ProductDocument, "_id">;
