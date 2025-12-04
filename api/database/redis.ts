import { createClient } from '@vercel/kv';
import { Redis } from 'ioredis';

// Cliente Redis - suporta Vercel KV e Redis local
let redisClient: any;

const initRedis = () => {
  // Tenta usar Vercel KV se as variáveis estiverem configuradas
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    console.log('Using Vercel KV');
    redisClient = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  } 
  // Caso contrário, usa Redis local (ioredis)
  else if (process.env.REDIS_URL) {
    console.log('Using local Redis');
    redisClient = new Redis(process.env.REDIS_URL);
  } else {
    console.log('Redis/KV not configured - caching disabled');
    redisClient = null;
  }
};

initRedis();

// Helper para cache com TTL (5 minutos = 300 segundos)
const CACHE_TTL = 300;

export const cacheGet = async (key: string): Promise<any> => {
  if (!redisClient) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: any, ttl: number = CACHE_TTL): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Redis SET error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis DEL error:', error);
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  
  try {
    // Para Vercel KV, precisamos implementar de forma diferente
    if (redisClient instanceof Redis) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
    // Vercel KV não suporta KEYS/DEL pattern diretamente
    // Então só logamos para desenvolvimento
    else {
      console.log('Pattern delete not supported on Vercel KV:', pattern);
    }
  } catch (error) {
    console.error('Redis DEL pattern error:', error);
  }
};

export default redisClient;
