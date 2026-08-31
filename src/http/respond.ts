import type { NextFunction, Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Response {
      success<T>(data?: T, meta?: Record<string, unknown>): this;
    }
  }
}


export function responseHelpers(req: Request, res: Response, next: NextFunction): void {
  res.success = function (data?: unknown, meta?: Record<string, unknown>) {
    // 204 nao pode ter payload, por definicao do HTTP. Sem `data`, encerra aqui.
    if (data === undefined) {
      this.status(204).end();
      return this;
    }

    // `statusCode` chega como 200 (padrao do Node). Se alguem mexeu nele antes,
    // essa escolha explicita vale mais do que a deducao.
    const status = this.statusCode !== 200 ? this.statusCode : req.method === "POST" ? 201 : 200;

    // Lista vazia e 200 com `data: []`, nunca 404: a collection existe, apenas
    // nenhum documento atende ao filtro. Os metadados ficam em `meta` para nao
    // se misturarem aos dados -- se `count` for igual a `limit`, o resultado
    // pode ter sido truncado.
    const body = Array.isArray(data)
      ? { data, meta: { count: data.length, ...meta } }
      : meta
        ? { data, meta }
        : { data };

    this.status(status).json(body);
    return this;
  };

  next();
}
