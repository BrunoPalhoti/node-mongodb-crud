import { ObjectId } from "mongodb";
import { invalidId } from "../errors/AppError.js";

/**
 * Converte o texto que veio da URL em ObjectId.
 */
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function toObjectId(value: string): ObjectId {
  if (!OBJECT_ID_PATTERN.test(value)) {
    throw invalidId(value);
  }
  return new ObjectId(value);
}

export function isObjectIdLike(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value);
}
