import Redis from 'ioredis';

const KV_URL = process.env.KV_URL;
const isMockMode = !KV_URL;

let kv: any;

if (isMockMode) {
  console.warn('⚠️  KV not configured - using in-memory cache (dev only)');
  const mockStore = new Map<string, { value: any; exp?: number }>();
  
  kv = {
    get: async (key: string) => {
      const entry = mockStore.get(key);
      if (!entry) return null;
      if (entry.exp && Date.now() > entry.exp) {
        mockStore.delete(key);
        return null;
      }
      return JSON.stringify(entry.value);
    },
    
    set: async (key: string, value: any, mode?: string, duration?: number) => {
      const exp = duration ? Date.now() + duration * 1000 : undefined;
      mockStore.set(key, { value, exp });
      return 'OK';
    },
    
    incr: async (key: string) => {
      const current = await kv.get(key);
      const next = current ? Number(current) + 1 : 1;
      await kv.set(key, next.toString());
      return next;
    },
  };
} else {
  kv = new Redis(KV_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });
  console.log('✅ Redis/KV configured');
}

export default kv;
