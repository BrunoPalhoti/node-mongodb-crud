import { Router } from "express";
import { productRoutes } from "./products/productRoutes.js";

export const apiRoutes = Router();

apiRoutes.use("/products", productRoutes);

