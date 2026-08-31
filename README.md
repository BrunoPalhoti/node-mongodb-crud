# node-mongodb-crud

Laboratorio de estudos: API **Express + TypeScript** falando com **MongoDB** pelo
**driver oficial `mongodb`** (sem Mongoose), para praticar os topicos 1.1 a 1.17.

A Fake Store API e usada **apenas uma vez**, na preparacao, para baixar os dados
para arquivos JSON locais. Nem a API nem o seed acessam a internet em execucao.

## Requisitos

- Node.js 20+ (validado com v24.11.0)
- MongoDB acessivel em `mongodb://127.0.0.1:27017` (validado com MongoDB 8.3.8)
- Docker **nao** e necessario

## Instalacao

```bash
npm install
cp .env.example .env   # ajuste se sua URI/porta forem diferentes
```

## Scripts

| Script              | O que faz                                                            |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Sobe a API com recarga automatica (`tsx watch`)                       |
| `npm run build`     | Compila TypeScript para `dist/`                                       |
| `npm start`         | Executa a versao compilada                                            |
| `npm run typecheck` | Checagem de tipos sem gerar arquivos                                  |
| `npm run check:db`  | Verifica conexao, versao do servidor e collections (somente leitura)  |
| `npm run db:indexes`| Garante os indices da aplicacao (idempotente)                          |

## Variaveis de ambiente

| Variavel          | Padrao                      | Finalidade                                     |
| ----------------- | --------------------------- | ---------------------------------------------- |
| `MONGODB_URI`     | `mongodb://127.0.0.1:27017` | Endereco do servidor                           |
| `MONGODB_DB`      | `fakestore_lab`             | Banco da API                                   |
| `MONGODB_DB_TEST` | `fakestore_lab_test`        | Banco isolado para verificacoes destrutivas    |
| `PORT`            | `3000`                      | Porta HTTP                                     |
| `DEFAULT_LIMIT`   | `20`                        | Limite padrao das listagens (topicos 1.2/1.12) |
| `MAX_LIMIT`       | `100`                       | Teto de `?limit=` aceito                       |

## Estrutura

```
src/
  config/env.ts               leitura e validacao das variaveis de ambiente
  db/mongo.ts                 conexao unica (MongoClient) reutilizada pelo processo
  errors/AppError.ts          erros de dominio com status HTTP
  errors/errorHandler.ts      traducao de erros para resposta JSON
  types/                      tipos dos documentos (product, user, cart)
  db/collections.ts           nomes das collections associados aos tipos
  db/indexes.ts               definicao dos indices da aplicacao
  scripts/checkConnection.ts  verificacao de ambiente, somente leitura
  scripts/ensureIndexes.ts    aplica os indices (npm run db:indexes)
  app.ts                      montagem do Express (rotas e middlewares)
  server.ts                   bootstrap: conecta -> escuta -> encerra com graca
```

Nao existe client nem service da Fake Store API em `src/`. A aplicacao nao
acessa a internet: uma busca por `fetch(` ou `fakestoreapi` em `src/` nao
retorna nada.

## Conectar ao banco (Compass, mongosh ou qualquer client)

```
mongodb://127.0.0.1:27017
```

Banco: **`fakestore_lab`**. Collections: `products`, `users`, `carts`.
Sem usuario e senha, porque a instalacao local roda sem autenticacao.
No Compass, `mongodb://localhost:27017` funciona igual.

## Origem dos dados

Os dados vieram da Fake Store API (`/products`, `/carts`, `/users`) numa coleta
**unica** em 2026-08-31: **20 produtos, 10 usuarios e 7 carrinhos**. Eles ja
estao carregados no MongoDB.

Todo o processo que trouxe esses dados -- a coleta, a inspecao, os JSON brutos
e o seed -- foi um **andaime**, nao parte do projeto. Fica em `tools/`, que
esta no `.gitignore`:

```
tools/
  fetchSourceData.ts     coleta (unico ponto que usou internet)
  inspectSourceData.ts   inspecao dos JSON
  data/raw/*.json        dados brutos ja sanitizados
  seed/                  transformacao e carga no MongoDB
```

O repositorio guarda a **API**, nao o processo que carregou os dados. A
consequencia e explicita: para reconstruir o banco a partir do zero seria
necessario refazer a coleta (procedimento no fim desta secao).

A criacao de **indices** foi mantida no projeto, em `src/db/indexes.ts` com o
script `npm run db:indexes`, porque nao e andaime: os indices unicos em `email`,
`username` e o parcial em `externalId` protegem escritas feitas pelas ROTAS,
nao apenas pelo seed.

### Transformacoes decididas a partir dos dados reais

| Origem                            | Modelo local                       | Motivo                                     |
| --------------------------------- | ---------------------------------- | ------------------------------------------ |
| `password` (users)                | **descartado**                     | autenticacao fora do escopo; nao versionar credencial |
| `__v` (users, carts)              | **descartado**                     | residuo do ORM da fonte, sem significado local |
| `id`                              | `externalId` (number)              | unico nas tres fontes; `_id` local e ObjectId |
| `date` (carts) `"2020-03-02T..."` | `Date` do BSON                     | ISO 8601 valida; permite comparacao temporal |
| `address.geolocation.lat/long`    | `number` (vinham como string)      | string nao suporta comparacao numerica     |
| `rating`                          | mantido **embutido** no produto    | sempre lido junto do produto               |

### Panorama dos dados (base para os filtros dos topicos 1.3, 1.15 e 1.16)

- Categorias: `electronics` (6), `jewelery` (4), `men's clothing` (4), `women's clothing` (6).
  A grafia `jewelery` e o apostrofo vem da fonte e foram preservados.
- `price`: de 7.95 a 999.99.
- `rating.rate`: de 1.9 a 4.8 -- logo, `?minRate=4.9` deve retornar lista vazia, nao erro.
- `image`: as 20 URLs comecam com `https://fakestoreapi.com/`.
- Integridade: 14 itens em 7 carrinhos, sem `userId` ou `productId` orfaos,
  sem quantidade invalida e sem data invalida.

### Refazer a coleta (so se o banco for perdido)

Baixe `https://fakestoreapi.com/products`, `/users` e `/carts`, salve como
`tools/data/raw/products.json`, `users.json` e `carts.json` (array JSON no
nivel externo), **remova o campo `password`** dos usuarios e rode o seed.

## Modelagem

Tres collections, uma por entidade com ciclo de vida proprio. Nao criei
`categories` nem `cart_items`: categoria e um atributo de texto do produto (a
lista de categorias e derivada, obtida com `distinct`), e um item de carrinho
nao existe fora do carrinho.

Vocabulario: **collection** e o conjunto de documentos (nao "tabela"),
**documento** e um registro, **campo** e uma chave do documento. Documentos da
mesma collection nao precisam ter os mesmos campos -- e o que permite produtos
com e sem `externalId` convivendo.

### `products`

Base principal do laboratorio.

| Campo         | Tipo       | Obrigatorio | Observacao                                   |
| ------------- | ---------- | ----------- | -------------------------------------------- |
| `_id`         | ObjectId   | automatico  | identificador local, usado nas rotas         |
| `externalId`  | number     | **nao**     | `id` da fonte; **ausente** nos criados na API |
| `title`       | string     | sim         |                                              |
| `price`       | number     | sim         | finito, >= 0                                 |
| `description` | string     | sim         |                                              |
| `category`    | string     | sim         |                                              |
| `image`       | string     | sim         |                                              |
| `rating.rate` | number     | sim         | 0 a 5                                        |
| `rating.count`| number     | sim         | inteiro >= 0                                 |
| `available`   | boolean    | sim         | campo **local**, padrao `true`               |
| `createdAt`   | Date       | automatico  | desempate na ordenacao                       |
| `updatedAt`   | Date       | automatico  | atualizado nas escritas                      |

```json
{
  "_id": "6a95919e0b8f6886c62c9079",
  "externalId": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
  "price": 109.95,
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png",
  "rating": { "rate": 3.9, "count": 120 },
  "available": true
}
```

`rating` fica **embutido**: tem tamanho fixo, e sempre lido junto do produto e
a notacao de ponto (`"rating.rate"`) permite filtrar o campo interno sem
collection separada. Uma collection `ratings` obrigaria a uma segunda consulta
para exibir qualquer produto, sem ganho nenhum.

### `users`

`name`, `address` e `address.geolocation` sao objetos **embutidos**: relacao
1:1, sempre lidos com o usuario e sem consulta isolada no laboratorio.
`password` **nao existe** aqui, foi descartado na coleta.

```json
{
  "_id": "6a95919e0b8f6886c62c906f",
  "externalId": 1,
  "email": "john@gmail.com",
  "username": "johnd",
  "name": { "firstname": "john", "lastname": "doe" },
  "phone": "1-570-236-7033",
  "address": {
    "street": "new road", "number": 7682, "city": "kilcoole",
    "zipcode": "12926-3874",
    "geolocation": { "lat": -37.3159, "long": 81.1496 }
  }
}
```

### `carts`

Duas decisoes em direcoes opostas, de proposito.

Os **itens ficam embutidos** em `items`: lista curta (no maior carrinho da
fonte sao 5 itens), nunca consultada isoladamente, e um item nao existe sem o
carrinho.

`userId` e `items[].productId` sao **referencias** (ObjectId), nao copias.
Produto e usuario tem ciclo de vida proprio -- preco muda, titulo e corrigido
-- e copiar esses dados criaria versoes divergentes espalhadas pelos carrinhos.

O inverso (embutir carrinhos no usuario) foi descartado porque a lista cresce
sem limite: na fonte, dois usuarios ja tem dois carrinhos cada.

Nao guardamos snapshot de preco no item, o que um checkout real exigiria --
checkout esta fora do escopo, e o preco atual vem sempre de `products`.

```json
{
  "_id": "6a95919e0b8f6886c62c908d",
  "externalId": 1,
  "userId": "6a95919e0b8f6886c62c906f",
  "date": "2020-03-02T00:00:00.000Z",
  "items": [
    { "productId": "6a95919e0b8f6886c62c9079", "quantity": 4 },
    { "productId": "6a95919e0b8f6886c62c907a", "quantity": 1 }
  ]
}
```

### `_id` versus `externalId`

`_id` e o identificador **local**, um ObjectId de 12 bytes gerado pelo
MongoDB, e e o que as rotas usam. `externalId` e apenas a lembranca de qual
`id` numerico o registro tinha na fonte; serve para o seed reconhecer o que ja
importou. Produtos criados pela API **nao tem** o campo -- ele fica ausente, e
nao presente com `null`, porque null faria o documento entrar no indice unico.

### Indices

| Collection | Indice                                            | Por que                                |
| ---------- | ------------------------------------------------- | -------------------------------------- |
| products   | `externalId` unico **parcial**                    | idempotencia do seed sem travar criacao local |
| products   | `{category, price}`                               | filtro por categoria + ordenacao por preco |
| products   | `{price}`                                         | faixas de preco e ordenacao            |
| products   | `{"rating.rate": -1}`                             | filtro e ordenacao por nota            |
| users      | `externalId` unico parcial, `email`, `username`   | email e username sao unicos no dominio |
| carts      | `externalId` unico parcial, `{userId, date: -1}`  | "carrinhos de um usuario", mais recentes primeiro |

O **indice unico parcial** e o detalhe que faz o modelo funcionar:

```js
db.products.createIndex(
  { externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $exists: true } } }
)
```

Um indice unico comum trataria a ausencia do campo como `null` e aceitaria
apenas **um** documento sem `externalId` -- o segundo produto criado pela API
falharia com erro de chave duplicada. O `partialFilterExpression` restringe o
indice aos documentos que possuem o campo; os demais ficam de fora e podem
existir em qualquer quantidade.

## Seed (andaime, em `tools/`)

Ja foi executado; a base esta populada. Registrado aqui porque explica como os
dados chegaram ao banco.

```bash
npx tsx tools/seed/runSeed.ts                            # popula MONGODB_DB
npx tsx tools/seed/runSeed.ts --db=fakestore_lab_test    # banco isolado
```

O que ele garante, tudo verificado:

- **Nao acessa a internet** -- le apenas `data/raw/*.json`.
- **Nao apaga nada** -- nao existe `drop` nem `delete` no codigo do seed.
- **Nao duplica** -- insere so os `externalId` ausentes. Reexecutar reporta
  tudo como ignorado.
- **Nao sobrescreve alteracoes locais** -- quem ja existe e ignorado, nunca
  atualizado. Editar um preco pela API e rodar o seed de novo nao desfaz a edicao.
- **Importa registros novos** -- se `data/raw` ganhar produtos, so eles entram.
- **Reporta** inseridos, ignorados e rejeitados, com o motivo de cada rejeicao.
- **Verifica integridade** ao final e sai com codigo 1 se houver referencia quebrada.
- **Fecha a conexao** ao terminar.

O que ele **nao** garante: atomicidade. `insertMany` nao e transacao, e
`users -> products -> carts` sao tres escritas independentes. Se o processo
morrer no meio, parte dos dados estara gravada -- e reexecutar completa o que
falta, justamente por ser idempotente. Transacoes estao fora do escopo do
modulo, e prometer atomicidade sem implementar seria pior que nao ter.

Rejeicao em cascata: um carrinho cujo usuario ou produto foi rejeitado e
rejeitado **por inteiro**, nunca gravado com parte dos itens.

## Endpoints disponiveis (etapas 1 a 3)

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db   # agora lista products, users e carts
```

## Progresso

- [x] Etapa 1 - Configuracao, conexao e tratamento de erros
- [x] Etapa 2 - Coleta dos dados de origem para JSON local
- [x] Etapa 3 - Modelagem das collections e seed idempotente
- [ ] Etapa 4+ - API e topicos 1.1 a 1.17
