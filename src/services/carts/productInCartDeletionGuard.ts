import { ObjectId } from "mongodb";
import * as cartRepository from "../../repositories/carts/cartRepository.js";
import { ProductDeletionGuard } from "../types.js";

export const productInCartDeletionGuard: ProductDeletionGuard = {
    async inspect(productId: ObjectId) {
        const cartCount = await cartRepository.countCartsWithProduct(productId);
        return {
            canDelete: cartCount === 0,
            cartCount: cartCount,
        };
    },
  };
