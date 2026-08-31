import { env } from "../config/env.js";
import { closeMongo, connectToMongo } from "../db/mongo.js";

/**
 * Verificacao de ambiente independente da API: confirma que ha um servidor
 * MongoDB acessivel, mostra a versao e lista as collections existentes.
 * Somente leitura -- nao cria nem altera nada.
 *
 * Equivalente no mongosh:
 *   db.adminCommand({ buildInfo: 1 })
 *   db.getCollectionNames()
 */
async function main(): Promise<void> {
  console.log(`[check] URI: ${env.mongoUri}`);
  console.log(`[check] banco: ${env.mongoDb}`);

  const db = await connectToMongo();
  const info = await db.admin().command({ buildInfo: 1 });
  console.log(`[check] conectado. MongoDB ${info.version}`);

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  if (collections.length === 0) {
    console.log(`[check] o banco "${db.databaseName}" ainda nao possui collections.`);
  } else {
    for (const c of collections) {
      const total = await db.collection(c.name).countDocuments();
      console.log(`[check]  - ${c.name}: ${total} documento(s)`);
    }
  }
}

main()
  .catch((err) => {
    console.error("[check] falhou:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  // finally garante que o processo nao fique pendurado pelo pool aberto.
  .finally(async () => {
    await closeMongo();
  });
