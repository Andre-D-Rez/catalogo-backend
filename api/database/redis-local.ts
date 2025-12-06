import { Redis } from 'ioredis';

// Redis local apenas para desenvolvimento
// Use este import quando rodar localmente com Docker

let redisClient: any;

if (process.env.REDIS_URL) {
  console.log('✅ Using local Redis (ioredis)');
  const redis = new Redis(process.env.REDIS_URL);
  
  redisClient = {
    get: (key: string) => redis.get(key),
    set: (key: string, value: any, opts?: { ex?: number }) =>
      opts?.ex ? redis.set(key, value, 'EX', opts.ex) : redis.set(key, value),
    incr: (key: string) => redis.incr(key),
    del: (key: string) => redis.del(key),
  };
} else {
  throw new Error('REDIS_URL not configured for local development');
}

export const kv = redisClient;
export default redisClient;
