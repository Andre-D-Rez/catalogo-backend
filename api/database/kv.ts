import { createClient } from '@vercel/kv';

// Cliente Redis/KV com suporte a desenvolvimento local e produção
let kvClient: any;

// Vercel KV (produção com REST API) - prioridade no Vercel
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  console.log('✅ Using Vercel KV');
  kvClient = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}
// Redis local (desenvolvimento) - usa ioredis para persistência real
else if (process.env.REDIS_URL) {
  console.log('✅ Using local Redis (ioredis)');
  
  // Importa ioredis de forma dinâmica
  const initRedis = async () => {
    try {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(process.env.REDIS_URL!);
      
      return {
        get: (key: string) => redis.get(key),
        set: (key: string, value: any, opts?: { ex?: number }) =>
          opts?.ex ? redis.set(key, value, 'EX', opts.ex) : redis.set(key, value),
        incr: (key: string) => redis.incr(key),
        del: (key: string) => redis.del(key),
      };
    } catch (error) {
      console.error('Failed to load ioredis, using mock');
      return null;
    }
  };
  
  // Inicializa de forma lazy
  let redisClient: any = null;
  kvClient = {
    get: async (key: string) => {
      if (!redisClient) redisClient = await initRedis();
      if (!redisClient) return null;
      return redisClient.get(key);
    },
    set: async (key: string, value: any, opts?: { ex?: number }) => {
      if (!redisClient) redisClient = await initRedis();
      if (!redisClient) return 'OK';
      return redisClient.set(key, value, opts);
    },
    incr: async (key: string) => {
      if (!redisClient) redisClient = await initRedis();
      if (!redisClient) return 1;
      return redisClient.incr(key);
    },
    del: async (key: string) => {
      if (!redisClient) redisClient = await initRedis();
      if (!redisClient) return 1;
      return redisClient.del(key);
    },
  };
}
// Fallback: mock em memória
else {
  console.warn('⚠️  Redis/KV not configured - using in-memory cache');
  console.warn('⚠️  Data will be lost on server restart');
  
  const mockStore = new Map<string, { value: any; exp?: number }>();
  
  kvClient = {
    get: async (key: string) => {
      const entry = mockStore.get(key);
      if (!entry) return null;
      if (entry.exp && Date.now() > entry.exp) {
        mockStore.delete(key);
        return null;
      }
      return entry.value ?? null;
    },
    set: async (key: string, value: any, opts?: { ex?: number }) => {
      const exp = opts?.ex ? Date.now() + opts.ex * 1000 : undefined;
      mockStore.set(key, { value, exp });
      return 'OK';
    },
    incr: async (key: string) => {
      const current = (await kvClient.get(key)) || 0;
      const next = Number(current) + 1;
      await kvClient.set(key, next);
      return next;
    },
    del: async (key: string) => {
      mockStore.delete(key);
      return 1;
    },
  };
}

export const kv = kvClient;
export default kv;
