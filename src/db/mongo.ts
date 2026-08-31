import { MongoClient, type Db } from "mongodb";
import { env } from "../config/env.js";

/**
 * Conexao unica e reutilizada durante todo o processo.
 *
 * O MongoClient mantem internamente um pool de conexoes. Criar um client por
 * requisicao esgotaria descritores de arquivo e adicionaria o custo de
 * handshake em cada chamada HTTP. Por isso guardamos o client em memoria no
 * modulo e apenas pedimos `db()`/`collection()` onde precisamos.
 */

let client: MongoClient | undefined;
let database: Db | undefined;

export interface ConnectOptions {
  /** Permite apontar para o banco de teste sem tocar no banco de estudo. */
  dbName?: string;
}

export async function connectToMongo(options: ConnectOptions = {}): Promise<Db> {
  if (database) return database;

  const dbName = options.dbName ?? env.mongoDb;

  client = new MongoClient(env.mongoUri, {
    // Falha rapido quando nao existe servidor escutando, em vez de pendurar
    // a requisicao por 30 segundos (padrao do driver).
    serverSelectionTimeoutMS: 5_000,
  });

  await client.connect();
  // O ping confirma que o servidor respondeu, nao apenas que a URI foi aceita.
  await client.db(dbName).command({ ping: 1 });

  database = client.db(dbName);
  return database;
}

/** Acesso sincrono ao Db ja conectado, usado pelos repositories. */
export function getDb(): Db {
  if (!database) {
    throw new Error("MongoDB nao conectado. Chame connectToMongo() antes de usar getDb().");
  }
  return database;
}

export async function closeMongo(): Promise<void> {
  await client?.close();
  client = undefined;
  database = undefined;
}
