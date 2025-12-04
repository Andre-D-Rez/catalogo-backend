# catalogo-backend

## Banco (MongoDB) — Configuração

### Variáveis de ambiente
```env
MONGODB_URI=mongodb://root:example@localhost:27017
MONGODB_DB_NAME=car-catalog
JWT_SECRET=troque-este-segredo
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### Conexão (`api/database/mongo.ts`)
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

### Docker Compose (local)
```yaml
services:
	mongo:
		image: mongo
		restart: always
		ports:
			- 27017:27017
		environment:
			MONGO_INITDB_ROOT_USERNAME: root
			MONGO_INITDB_ROOT_PASSWORD: example

	mongo-express:
		image: mongo-express
		restart: always
		ports:
			- 8081:8081
		environment:
			ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
			ME_CONFIG_BASICAUTH_ENABLED: true
			ME_CONFIG_BASICAUTH_USERNAME: mongoexpressuser
			ME_CONFIG_BASICAUTH_PASSWORD: mongoexpresspass
```

### Como rodar localmente
- Copie `.env.example` para `.env` e ajuste valores conforme necessário.
- Suba dependências locais: `docker compose up -d`.
- Instale dependências: `npm install`.
- Rode uma checagem de conexão: `npm run dev`.