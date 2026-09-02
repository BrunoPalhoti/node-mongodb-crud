import { Router } from "express";
import * as productController from "../controllers/productController.js";

export const productRoutes = Router();

productRoutes.get("/", productController.list);
productRoutes.get("/:id", productController.getById);

productRoutes.post("/", productController.create);

productRoutes.patch("/:id", productController.update);

productRoutes.delete("/:id", productController.remove);
