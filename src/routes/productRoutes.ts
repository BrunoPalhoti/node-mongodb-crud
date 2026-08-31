import { Router } from "express";
import * as productController from "../controllers/productController.js";


export const productRoutes = Router();

productRoutes.post("/", productController.create); 
productRoutes.get("/", productController.list);

productRoutes.get("/:id", productController.getById); 
