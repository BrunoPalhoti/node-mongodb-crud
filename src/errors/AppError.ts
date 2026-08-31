export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, "BAD_REQUEST", message, details);

export const invalidId = (received: string) =>
  new AppError(
    400,
    "INVALID_OBJECT_ID",
    `id invalido: "${received}". Esperado um ObjectId de 24 caracteres hexadecimais.`,
  );

export const notFound = (message: string) => new AppError(404, "NOT_FOUND", message);

export const conflict = (message: string, details?: unknown) =>
  new AppError(409, "CONFLICT", message, details);
