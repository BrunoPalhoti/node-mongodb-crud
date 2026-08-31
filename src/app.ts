import express, { type Express, type Request, type Response } from "express";
import { getDb } from "./db/mongo.js";
import { errorHandler, notFoundHandler } from "./errors/errorHandler.js";
import { responseHelpers } from "./http/respond.js";
import { apiRoutes } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.use(responseHelpers);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
  });

  app.get("/health/db", async (_req: Request, res: Response, next) => {
    try {
      const db = getDb();
      const result = await db.command({ ping: 1 });
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      res.json({
        status: "ok",
        database: db.databaseName,
        ping: result.ok === 1,
        collections: collections.map((c) => c.name),
      });
    } catch (err) {
      next(err);
    }
  });

  app.use(apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
