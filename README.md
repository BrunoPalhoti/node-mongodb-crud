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
data/raw/                     dados de origem coletados uma unica vez (versionados)
src/
  config/env.ts               leitura e validacao das variaveis de ambiente
  db/mongo.ts                 conexao unica (MongoClient) reutilizada pelo processo
  errors/AppError.ts          erros de dominio com status HTTP
  errors/errorHandler.ts      traducao de erros para resposta JSON
  scripts/checkConnection.ts  verificacao de ambiente, somente leitura
  app.ts                      montagem do Express (rotas e middlewares)
  server.ts                   bootstrap: conecta -> escuta -> encerra com graca
```

Nao existe client nem service da Fake Store API em `src/`. A aplicacao nao
acessa a internet: uma busca por `fetch(` ou `fakestoreapi` em `src/` nao
retorna nada.

## Origem dos dados

Os arquivos em `data/raw/` foram baixados **uma unica vez** da Fake Store API
(`/products`, `/carts`, `/users`) em 2026-08-31: **20 produtos, 10 usuarios e 7
carrinhos**. Eles sao a fonte do seed e estao versionados justamente para que o
seed funcione sem internet.

Os scripts que fizeram essa coleta foram um andaime de preparacao, nao parte do
projeto: ficam em `tools/` e estao no `.gitignore`. Se voce precisar refazer a
coleta algum dia, o procedimento esta documentado abaixo -- mas nada no
laboratorio depende disso.

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

### Refazer a coleta (opcional, nunca necessario)

Baixe as tres URLs, salve como `data/raw/products.json`, `users.json` e
`carts.json` (array JSON no nivel externo) e **remova o campo `password`** dos
usuarios antes de gravar.

## Endpoints disponiveis (etapa 1)

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```

## Progresso

- [x] Etapa 1 - Configuracao, conexao e tratamento de erros
- [x] Etapa 2 - Coleta dos dados de origem para JSON local
- [ ] Etapa 3 - Modelagem das collections e seed idempotente
- [ ] Etapa 4+ - API e topicos 1.1 a 1.17
