import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis.Redis;
  }
}

const redisPlugin: FastifyPluginAsync<{ url?: string }> = async (fastify, opts) => {
  const redis = new Redis.default(opts.url || 'redis://localhost:6379');

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async (instance) => {
    await redis.quit();
  });
};

export default fp(redisPlugin);

export const writeToCache = async (redis: Redis.default, key: string, value: string, ttl?: number): Promise<void> => {
  if (ttl) {
    await redis.set(key, value, 'EX', ttl)
  } else {
    await redis.set(key, value)
  }
}

export const readCache = async (redis: Redis.default, key: string): Promise<string | null> => {
    return await redis.get(key)
}
