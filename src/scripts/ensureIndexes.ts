import { COLLECTIONS } from "../db/collections.js";
import { ensureIndexes } from "../db/indexes.js";
import { closeMongo, connectToMongo } from "../db/mongo.js";

async function main(): Promise<void> {
  const dbArg = process.argv.find((a) => a.startsWith("--db="));
  const dbName = dbArg?.slice("--db=".length);

  const db = await connectToMongo(dbName ? { dbName } : {});
  console.log(`[indexes] banco: ${db.databaseName}`);

  const created = await ensureIndexes(db);
  console.log(`[indexes] ${created.length} indice(s) garantido(s).`);

  // Mostra o estado final por collection: nome, chaves e se e unico/parcial.
  // Equivalente no mongosh: db.products.getIndexes()
  for (const name of Object.values(COLLECTIONS)) {
    const collection = db.collection(name);
    console.log(`[indexes] ${name}:`);
    for (const index of await collection.indexes()) {
      const flags = [
        index.unique ? "unique" : "",
        index.partialFilterExpression ? "parcial" : "",
      ]
        .filter(Boolean)
        .join(", ");
      console.log(
        `[indexes]   ${index.name} ${JSON.stringify(index.key)}${flags ? ` (${flags})` : ""}`,
      );
    }
  }
}

main()
  .catch((err) => {
    console.error("[indexes] falhou:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
