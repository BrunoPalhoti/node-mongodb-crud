import type { NextFunction, Request, Response } from "express";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";
import { isProduction } from "../config/env.js";

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

  if (err instanceof SyntaxError && "status" in err && "body" in err) {
    res.status(400).json({
      error: { code: "INVALID_JSON", message: "Corpo da requisicao nao e um JSON valido." },
    });
    return;
  }

  if (typeof err === "object" && err !== null && "type" in err && "status" in err) {
    const parseError = err as { type: string; status: number };
    if (parseError.type === "entity.too.large") {
      res.status(413).json({
        error: { code: "PAYLOAD_TOO_LARGE", message: "Corpo da requisicao excede o limite de 1mb." },
      });
      return;
    }
  }

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

  console.error("[erro nao tratado]", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno.",
      ...(isProduction ? {} : { hint: "Detalhes completos foram gravados no log do servidor." }),
    },
  });
}
