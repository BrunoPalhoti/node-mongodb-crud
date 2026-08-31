import express, { type Express, type Request, type Response } from "express";
import { getDb } from "./db/mongo.js";
import { errorHandler, notFoundHandler } from "./errors/errorHandler.js";

/**
 * Monta o app sem abrir servidor nem conexao. Isso mantem `app.ts` testavel e
 * deixa a ordem de inicializacao explicita em `server.ts`:
 * conectar -> montar rotas -> escutar.
 */
export function createApp(): Express {
  const app = express();

  // Limite de corpo: evita que um lote gigante consuma memoria antes da validacao.
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
  });

  // Confirma que o processo fala com o MongoDB agora, nao apenas no boot.
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

  // As rotas de dominio (products, users, carts) entram aqui nas proximas etapas.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
