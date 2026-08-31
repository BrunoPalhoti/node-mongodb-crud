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
src/
  config/env.ts               leitura e validacao das variaveis de ambiente
  db/mongo.ts                 conexao unica (MongoClient) reutilizada pelo processo
  errors/AppError.ts          erros de dominio com status HTTP
  errors/errorHandler.ts      traducao de erros para resposta JSON
  scripts/checkConnection.ts  verificacao de ambiente, somente leitura
  app.ts                      montagem do Express (rotas e middlewares)
  server.ts                   bootstrap: conecta -> escuta -> encerra com graca
```

## Endpoints disponiveis (etapa 1)

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```

## Progresso

- [x] Etapa 1 - Configuracao, conexao e tratamento de erros
- [ ] Etapa 2 - Coleta dos dados de origem para JSON local
- [ ] Etapa 3 - Modelagem das collections e seed idempotente
- [ ] Etapa 4+ - API e topicos 1.1 a 1.17
