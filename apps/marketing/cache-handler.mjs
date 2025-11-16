import {CacheHandler} from '@fortedigital/nextjs-cache-handler';
import createLruHandler from '@fortedigital/nextjs-cache-handler/local-lru';
import createRedisHandler from '@fortedigital/nextjs-cache-handler/redis-strings';
import {PHASE_PRODUCTION_BUILD} from 'next/constants.js';
import {createClient} from 'redis';

// Important - It's recommended to use global scope to ensure only one Redis connection is made
// This ensures only one instance get created
const isSingleConnectionModeEnabled = !!process.env.REDIS_SINGLE_CONNECTION;

async function setupRedisClient() {
  if (PHASE_PRODUCTION_BUILD !== process.env.NEXT_PHASE) {
    try {
      const redisClient = createClient({
        url: process.env.REDIS_WRITE_URL,
        pingInterval: 10000,
      });

      redisClient.on('error', e => {
        if (process.env.NEXT_PRIVATE_DEBUG_CACHE !== undefined) {
          console.warn('Redis error', e);
        }
        if (isSingleConnectionModeEnabled) {
          global.cacheHandlerConfig = null;
          global.cacheHandlerConfigPromise = null;
        }
      });

      console.info('Connecting Redis client...', process.env.REDIS_WRITE_URL);
      await redisClient.connect();
      console.info('Redis client connected.');

      if (!redisClient.isReady) {
        console.error('Failed to initialize caching layer.');
      }

      return redisClient;
    } catch (error) {
      console.warn('Failed to connect Redis client:', error);
    }
  }

  return null;
}

function createLRURedisHandler(options) {
  const lruHandler = options.lruHandler;
  const redisHandler = options.redisHandler;

  return {
    name: 'lru-redis',
    async get(key, ctx) {
      // Check LRU first
      const lruResult = await lruHandler.get(key, ctx);
      if (lruResult !== null) {
        return lruResult;
      }

      // Fallback to Redis on miss
      const redisResult = await redisHandler.get(key, ctx);
      if (redisResult !== null) {
        // Auto-populate LRU if found in Redis
        await lruHandler.set(key, redisResult);
        return redisResult;
      }

      // Miss in both
      return null;
    },
    async set(key, value) {
      await Promise.all([
        lruHandler.set(key, value),
        redisHandler.set(key, value),
      ]);
    },
    async revalidateTag(tag) {
      await Promise.all([
        lruHandler.revalidateTag(tag),
        redisHandler.revalidateTag(tag),
      ]);
    },
    async delete(key) {
      await Promise.all([lruHandler.delete(key), redisHandler.delete(key)]);
    },
  };
}

async function createCacheConfig() {
  const redisClient = await setupRedisClient();
  const lruCache = createLruHandler();

  if (!redisClient) {
    const config = {handlers: [lruCache]};
    if (isSingleConnectionModeEnabled) {
      global.cacheHandlerConfigPromise = null;
      global.cacheHandlerConfig = config;
    }
    return config;
  }

  const redisCacheHandler = createRedisHandler({
    client: redisClient,
    keyPrefix: 'marketing-sites:::',
  });

  const config = {
    handlers: [
      createLRURedisHandler({
        lruHandler: lruCache,
        redisHandler: redisCacheHandler,
      }),
    ],
  };

  if (isSingleConnectionModeEnabled) {
    global.cacheHandlerConfigPromise = null;
    global.cacheHandlerConfig = config;
  }

  return config;
}

CacheHandler.onCreation(() => {
  if (isSingleConnectionModeEnabled) {
    if (global.cacheHandlerConfig) {
      return global.cacheHandlerConfig;
    }
    if (global.cacheHandlerConfigPromise) {
      return global.cacheHandlerConfigPromise;
    }
  }

  const promise = createCacheConfig();
  if (isSingleConnectionModeEnabled) {
    global.cacheHandlerConfigPromise = promise;
  }
  return promise;
});

export default CacheHandler;
