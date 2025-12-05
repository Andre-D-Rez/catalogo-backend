import { createClient } from '@vercel/kv';

// Cliente Redis/KV compatível com Vercel KV
export const kv = createClient({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

// Fallback mock para desenvolvimento local sem KV configurado
const isMockMode = !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;

if (isMockMode) {
  console.warn('⚠️  KV not configured - using in-memory cache (dev only)');
  const mockStore = new Map<string, { value: any; exp?: number }>();
  
  (kv as any).get = async (key: string) => {
    const entry = mockStore.get(key);
    if (!entry) return null;
    if (entry.exp && Date.now() > entry.exp) {
      mockStore.delete(key);
      return null;
    }
    return entry.value;
  };
  
  (kv as any).set = async (key: string, value: any, opts?: { ex?: number }) => {
    const exp = opts?.ex ? Date.now() + opts.ex * 1000 : undefined;
    mockStore.set(key, { value, exp });
    return 'OK';
  };
  
  (kv as any).incr = async (key: string) => {
    const current = (await (kv as any).get(key)) || 0;
    const next = Number(current) + 1;
    await (kv as any).set(key, next);
    return next;
  };
}

export default kv;
