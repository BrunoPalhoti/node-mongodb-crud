import { Router } from "express";
import { productRoutes } from "./productRoutes.js";

export const apiRoutes = Router();

apiRoutes.use("/products", productRoutes);

