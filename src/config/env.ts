import "dotenv/config";

/**
 * Centraliza a leitura de variaveis de ambiente. Ler process.env em um unico
 * lugar evita que a aplicacao suba com configuracao incompleta e falhe so
 * quando a primeira requisicao chegar.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return value.trim();
}

function intWithDefault(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Variavel ${name} deve ser um inteiro positivo. Recebido: ${raw}`);
  }
  return parsed;
}

export const env = {
  mongoUri: required("MONGODB_URI"),
  mongoDb: required("MONGODB_DB"),
  mongoDbTest: process.env.MONGODB_DB_TEST?.trim() || "fakestore_lab_test",
  port: intWithDefault("PORT", 3000),
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  defaultLimit: intWithDefault("DEFAULT_LIMIT", 20),
  maxLimit: intWithDefault("MAX_LIMIT", 100),
} as const;

export const isProduction = env.nodeEnv === "production";
