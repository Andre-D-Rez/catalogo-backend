# catalogo-backend

API REST para catálogo de veículos usando **Redis** como banco de dados principal e cache.

## Banco de Dados

### Redis/KV — Armazenamento e Cache

O projeto usa **Redis** como banco de dados principal e cache, com suporte para **desenvolvimento local** e **produção na Vercel**.

#### Variáveis de ambiente

```env
# Redis
REDIS_URL=redis://localhost:****

# JWT
JWT_SECRET=troque-este-segredo
```

#### Como funciona

O sistema detecta automaticamente qual implementação usar:

1. **Redis Local**: Se `REDIS_URL` estiver definida, usa Redis local via ioredis
2. **Produção (Vercel)**: Se `KV_REST_API_URL` e `KV_REST_API_TOKEN` estiverem definidas, usa Vercel KV
3. **Fallback**: Se nenhuma variável estiver configurada, usa mock em memória (apenas desenvolvimento)

#### Configuração Local (Docker)

O `docker-compose.yml` inclui Redis e interface de gerenciamento:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  redis-commander:
    image: rediscommander/redis-commander:latest
    ports:
      - "8082:8081"
```

Interface de gerenciamento:
- **Redis Commander**: http://localhost:8082

#### Configuração Produção (Vercel KV)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** → **Create Database** → **KV**
4. Copie as variáveis geradas para o arquivo `.env` da Vercel
5. As variáveis estarão disponíveis automaticamente no deploy

#### Uso no Código

Os dados dos veículos e usuários são armazenados diretamente no Redis:

```ts
// Modelos Redis
import { VeiculoRedisAdapter } from './models/Veiculo.redis.js';
import { UserRedisAdapter } from './models/User.redis.js';

// Cache KV
import kv from './database/kv.js';

// Salvar no cache (5 minutos)
await kv.set('chave', JSON.stringify(dados), { ex: 300 });

// Buscar do cache
const dados = await kv.get('chave');

// Incrementar contador
await kv.incr('veiculos:version');
```

#### Funcionalidades Implementadas

- ✅ Armazenamento completo de veículos no Redis
- ✅ Sistema de autenticação com usuários no Redis
- ✅ Cache de listagem de veículos com paginação
- ✅ Invalidação automática de cache ao criar/atualizar/deletar
- ✅ Versionamento de cache para invalidação global
- ✅ TTL configurável (padrão: 5 minutos)
- ✅ Fallback automático com mock em memória

## Estrutura do Projeto

```
api/
├── controllers/       # Lógica de requisição/resposta
├── database/
│   ├── kv.ts         # Cliente Redis/KV unificado
│   └── redis.ts      # Configuração Redis
├── middlewares/      # Auth e validações
├── models/
│   ├── Veiculo.redis.ts  # Modelo de veículos (Redis)
│   └── User.redis.ts     # Modelo de usuários (Redis)
├── routes/           # Rotas da API
├── services/         # Lógica de negócio e cache
├── index.ts          # Configuração Express (Vercel)
└── server.ts         # Servidor local
```

## API Endpoints

### Veículos

- `GET /api/veiculos` - Listar veículos (com paginação e filtros)
- `GET /api/veiculos/:id` - Detalhes de um veículo
- `POST /api/veiculos` - Criar veículo (requer admin)
- `PUT /api/veiculos/:id` - Atualizar veículo (requer admin)
- `DELETE /api/veiculos/:id` - Deletar veículo (requer admin)

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

## Docker Compose (Local)

### Serviços disponíveis

```yaml
services:
  redis:           # Banco de dados Redis
  redis-commander: # Interface web Redis (porta 8082)
```

### Como rodar localmente

1. Copie `.env.example` para `.env` e ajuste valores:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis essenciais no `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=seu-segredo-jwt
   USER_SERVICE_URL=http://localhost:3000
   ```

3. Suba o Redis via Docker:
   ```bash
   docker compose up -d
   ```

4. Instale as dependências:
   ```bash
   npm install
   ```

5. Execute o servidor:
   ```bash
   npm run dev
   ```

### Interfaces de Gerenciamento

Após subir os containers:

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Redis Commander**: http://localhost:8082

## Deploy na Vercel

1. Configure as variáveis de ambiente no Vercel Dashboard:
   ```env
   KV_REST_API_URL=
   KV_REST_API_TOKEN=
   JWT_SECRET=
   USER_SERVICE_URL=
   ```

2. O projeto já está configurado para deploy serverless (usa `api/index.ts`)

3. Push para o repositório conectado ao Vercel

## Tecnologias

- **Node.js** + **TypeScript**
- **Express 5**
- **Redis** / **ioredis** / **Vercel KV**
- **JWT** para autenticação
- **Swagger** para documentação
- **Docker** para desenvolvimento local