import { ObjectId } from "mongodb";
import { invalidId } from "../errors/AppError.js";

/**
 * Converte o texto que veio da URL em ObjectId.
 */
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function toObjectId(value: string): ObjectId {
  if (!OBJECT_ID_PATTERN.test(value)) {
    // 400, e nao 404: o cliente mandou algo que nunca poderia ser um id.
    // Reservamos o 404 para um id bem formado que simplesmente nao existe.
    throw invalidId(value);
  }
  return new ObjectId(value);
}

export function isObjectIdLike(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value);
}
