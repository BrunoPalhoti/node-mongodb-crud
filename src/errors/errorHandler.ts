import type { NextFunction, Request, Response } from "express";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";
import { isProduction } from "../config/env.js";

/** 404 para rotas inexistentes: sem isso o Express devolveria HTML. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  // Erros de validacao do zod chegam aqui quando o schema roda fora do middleware.
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Payload invalido.",
        details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    });
    return;
  }

  // 11000 = violacao de indice unico. Aqui aparece, por exemplo, ao tentar
  // criar dois produtos com o mesmo externalId.
  if (err instanceof MongoServerError && err.code === 11000) {
    res.status(409).json({
      error: {
        code: "DUPLICATE_KEY",
        message: "Documento viola um indice unico.",
        details: err.keyValue,
      },
    });
    return;
  }

  // Log no servidor, resposta generica para o cliente: stack trace e mensagem
  // do driver podem conter host, porta e nomes internos.
  console.error("[erro nao tratado]", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno.",
      ...(isProduction ? {} : { hint: "Detalhes completos foram gravados no log do servidor." }),
    },
  });
}
