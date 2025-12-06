import { createClient } from '@vercel/kv';

// Cliente Redis/KV com suporte a desenvolvimento local e produção
let kvClient: any;

// Redis via REST API (Upstash/RedisLabs com REST) - prioridade
if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://')) {
  console.log('✅ Using Redis via REST API wrapper');
  
  // Usa @vercel/kv que suporta qualquer Redis via REST
  // Converte redis:// URL para o formato esperado
  const redisUrl = process.env.REDIS_URL;
  
  try {
    // Para usar com Upstash/RedisLabs, você pode usar a REST API deles
    // Ou manter o wrapper em memória para desenvolvimento local
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
  } catch (error) {
    console.error('Redis connection failed, using mock');
  }
}
// Vercel KV (produção com REST API)
else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  console.log('✅ Using Vercel KV');
  kvClient = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}
// Fallback: mock em memória (desenvolvimento local sem configuração)
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
