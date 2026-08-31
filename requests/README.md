# requests/

Requisicoes prontas para executar direto do editor, servindo tambem como
documentacao viva da API: cada arquivo cobre **uma rota**, com os casos de
sucesso e os de erro lado a lado.

## Como usar

Instale a extensao **REST Client** (`humao.rest-client`) no Cursor/VS Code.
Abra qualquer `.http` e clique em **Send Request**, que aparece acima de cada
requisicao. No JetBrains, os mesmos arquivos funcionam nativamente.

Antes de rodar, suba a API:

```bash
npm run dev
```

## Organizacao

```
requests/
  health.http                       /health e /health/db
  products/
    create-product.http             POST   /products      (1.1)
    list-products.http              GET    /products      (1.2, 1.3, 1.12)
    get-product-by-id.http          GET    /products/:id  (1.4)
```

Um arquivo por rota. Conforme as etapas avancarem, entram
`update-product.http`, `delete-product.http`, `count-products.http` e as pastas
`users/` e `carts/`.

## Formato das respostas

Sucesso vai em `data`, erro vai em `error`. Colecoes acrescentam `meta`:

```json
{ "data": { "_id": "...", "title": "..." } }
{ "data": [ ... ], "meta": { "count": 3, "limit": 20 } }
{ "error": { "code": "NOT_FOUND", "message": "..." } }
```

As rotas de `/health` sao excecao e nao usam envelope: nao representam recurso,
e ferramentas de monitoramento esperam o status na raiz.

## Convencoes

Cada requisicao e separada por `###` e comeca com um titulo indicando se e
**SUCESSO** ou **ERRO**, seguido do status esperado e do motivo. Exemplo:

```http
### 4) ERRO -- price negativo
# Esperado: 400 BAD_REQUEST -- "price nao pode ser negativo"
POST {{baseUrl}}/products
```

O `@baseUrl` no topo de cada arquivo aponta para `http://localhost:3000`. Se
voce mudar `PORT` no `.env`, ajuste essa linha.

## Encadeamento de requisicoes

`get-product-by-id.http` precisa de um `_id` que existe de verdade, e ids sao
gerados pelo MongoDB. Em vez de pedir copia e cola, a primeira requisicao e
nomeada e a segunda reaproveita a resposta dela:

```http
# @name buscarUmProduto
GET {{baseUrl}}/products?limit=1

###
@productId = {{buscarUmProduto.response.body.$.data[0]._id}}
GET {{baseUrl}}/products/{{productId}}
```

Rode as duas na ordem. Se a segunda falhar com um id vazio, e porque a primeira
ainda nao foi executada nesta sessao do editor.

## Aviso

As requisicoes de escrita **alteram o banco de verdade** (`fakestore_lab`).
Os `POST` de exemplo criam produtos reais. Para experimentar sem consequencia,
aponte a API para outro banco mudando `MONGODB_DB` no `.env` e reiniciando.
