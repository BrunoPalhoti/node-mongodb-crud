import type { ObjectId } from "mongodb";

/**
 * Collection `products`.
 *
 * `rating` fica EMBUTIDO no produto: e sempre lido junto dele, tem tamanho
 * fixo (dois campos) e nao cresce com o tempo. Separar em outra collection
 * exigiria uma segunda consulta para exibir qualquer produto, sem nenhum
 * ganho. A notacao de ponto ("rating.rate") permite filtrar o campo interno
 * sem precisar de collection propria -- e exatamente o topico 1.14.
 */
export interface ProductRating {
  rate: number;
  count: number;
}

export interface ProductDocument {
  /** Identificador LOCAL, gerado pelo MongoDB. E a chave usada nas rotas. */
  _id: ObjectId;

  /**
   * Preserva o `id` numerico da fonte. Ausente nos produtos criados pela API:
   * o campo simplesmente nao existe no documento, em vez de existir com null.
   * Isso mantem a semantica "nao veio de fora" e funciona com o indice unico
   * parcial (ver src/db/indexes.ts).
   */
  externalId?: number;

  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;

  /** Campo LOCAL, sem equivalente na fonte. Comeca como true. */
  available: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/** O que o seed monta antes de inserir: o _id fica por conta do MongoDB. */
export type NewProductDocument = Omit<ProductDocument, "_id">;
