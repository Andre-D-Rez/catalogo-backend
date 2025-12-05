# catalogo-backend

## Banco de Dados

### MongoDB — Configuração

#### Variáveis de ambiente
```env
MONGODB_URI=mongodb://root:example@localhost:27017
MONGODB_DB_NAME=car-catalog
JWT_SECRET=troque-este-segredo
```

#### Conexão (`api/database/mongo.ts`)
```ts
import 'dotenv/config';
import mongoose from 'mongoose';

const connect = async (): Promise<void> => {
	mongoose.set('strictQuery', true);
	const MONGODB_URI = process.env.MONGODB_URI;
	if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables.');
	await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'example' });
	console.log('Database connection successful');
};

export default { connect };
```

### Redis/KV — Cache e Performance

O projeto usa Redis para cache, com suporte tanto para **desenvolvimento local** quanto para **produção na Vercel**.

#### Variáveis de ambiente

```env
# Redis Local (desenvolvimento)
REDIS_URL=redis://localhost:6379

# Vercel KV (produção)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

#### Como funciona

O sistema detecta automaticamente qual implementação usar:

1. **Produção (Vercel)**: Se `KV_REST_API_URL` e `KV_REST_API_TOKEN` estiverem definidas, usa Vercel KV
2. **Desenvolvimento Local**: Se `REDIS_URL` estiver definida, usa Redis local via ioredis
3. **Fallback**: Se nenhuma variável estiver configurada, desabilita o cache (modo mock)

#### Configuração Local (Docker)

O `docker-compose.yml` já inclui Redis:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"

redis-commander:
  image: rediscommander/redis-commander:latest
  ports:
    - "8082:8081"
```

Interfaces de gerenciamento:
- **Redis Commander**: http://localhost:8082 (gerenciar cache)

#### Configuração Produção (Vercel KV)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** → **Create Database** → **KV**
4. Copie as variáveis geradas para o arquivo `.env` da Vercel
5. As variáveis estarão disponíveis automaticamente no deploy

#### Uso no Código

```ts
import kv from './database/kv.js';

// Salvar no cache (5 minutos)
await kv.set('chave', dados, { ex: 300 });

// Buscar do cache
const dados = await kv.get('chave');

// Incrementar contador
await kv.incr('veiculos:version');
```

#### Funcionalidades Implementadas

- ✅ Cache de listagem de veículos com paginação
- ✅ Invalidação automática de cache ao criar/atualizar/deletar
- ✅ Versionamento de cache para invalidação global
- ✅ TTL configurável (padrão: 5 minutos)
- ✅ Fallback automático se cache não estiver disponível

## Docker Compose (Local)

### Serviços disponíveis

```yaml
services:
  mongo:           # Banco de dados MongoDB
  mongo-express:   # Interface web MongoDB (porta 8081)
  redis:           # Cache Redis
  redis-commander: # Interface web Redis (porta 8082)
```

### Como rodar localmente

1. Copie `.env.example` para `.env` e ajuste valores:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis essenciais no `.env`:
   ```env
   MONGODB_URI=mongodb://root:example@localhost:27017
   MONGODB_DB_NAME=car-catalog
   JWT_SECRET=seu-segredo-jwt
   REDIS_URL=redis://localhost:6379
   ```

3. Suba os serviços Docker:
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
- **Swagger**: http://localhost:3000/api-docs
- **Mongo Express**: http://localhost:8081
  - Usuário: `mongoexpressuser`
  - Senha: `mongoexpresspass`
- **Redis Commander**: http://localhost:8082