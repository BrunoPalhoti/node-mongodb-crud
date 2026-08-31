import type { ObjectId } from "mongodb";

export interface UserName {
  firstname: string;
  lastname: string;
}


export interface Geolocation {
  lat: number;
  long: number;
}

export interface UserAddress {
  street: string;
  number: number;
  city: string;
  zipcode: string;
  geolocation: Geolocation;
}

export interface UserDocument {
  _id: ObjectId;
  externalId?: number;
  email: string;
  username: string;
  name: UserName;
  phone: string;
  address: UserAddress;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUserDocument = Omit<UserDocument, "_id">;
