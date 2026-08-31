import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeMongo, connectToMongo } from "./db/mongo.js";

async function main(): Promise<void> {
  // Conectar antes de escutar: assim a API nunca aceita requisicao que
  // fatalmente falharia por falta de banco.
  const db = await connectToMongo();
  console.log(`[mongo] conectado ao banco "${db.databaseName}"`);

  const server = createApp().listen(env.port, () => {
    console.log(`[http] ouvindo em http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Encerramento adequado: para de aceitar novas conexoes HTTP e so depois
  // devolve o pool do MongoClient.
  const shutdown = (signal: string) => {
    console.log(`\n[app] recebido ${signal}, encerrando...`);
    server.close(async () => {
      await closeMongo();
      console.log("[app] conexoes encerradas.");
      process.exit(0);
    });
    // Rede de seguranca caso alguma conexao fique presa.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch(async (err) => {
  console.error("[app] falha ao iniciar:", err instanceof Error ? err.message : err);
  await closeMongo();
  process.exit(1);
});
