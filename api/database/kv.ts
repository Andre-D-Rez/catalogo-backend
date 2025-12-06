import { createClient } from '@vercel/kv';
import { Redis } from 'ioredis';

// Cliente Redis/KV com suporte a desenvolvimento local e produção
let kvClient: any;

// Tenta usar Redis local primeiro (desenvolvimento)
if (process.env.REDIS_URL) {
  console.log('✅ Using local Redis');
  const redis = new Redis(process.env.REDIS_URL);
  kvClient = {
    get: (key: string) => redis.get(key),
    // Normaliza opções para sintaxe EX da API do Redis
    set: (key: string, value: any, opts?: { ex?: number }) =>
      opts?.ex ? redis.set(key, value, 'EX', opts.ex) : redis.set(key, value),
    incr: (key: string) => redis.incr(key),
    del: (key: string) => redis.del(key),
  };
}
// Depois tenta Vercel KV (produção)
else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  console.log('✅ Using Vercel KV');
  kvClient = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}
// Fallback: mock em memória
else {
  console.warn('⚠️  Redis/KV not configured - using in-memory cache (dev only)');
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
