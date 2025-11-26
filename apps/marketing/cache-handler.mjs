import {CacheHandler} from '@fortedigital/nextjs-cache-handler';
import createLruHandler from '@fortedigital/nextjs-cache-handler/local-lru';
import createRedisHandler from '@fortedigital/nextjs-cache-handler/redis-strings';
import {PHASE_PRODUCTION_BUILD} from 'next/constants.js';
import {createClient} from 'redis';

/**
 * Sets up a Redis client. Can be a read or write client.
 * @param {string} endpoint - The Redis server endpoint.
 * @returns {Promise<RedisClient|null>} - The Redis client or null if not in production.
 */
async function setupRedisClient(endpoint) {
  if (PHASE_PRODUCTION_BUILD === process.env.NEXT_PHASE) {
    return null;
  }

  if (!endpoint) {
    console.warn(
      'No Redis endpoint provided. Skipping Redis cache layer setup.',
    );
    return null;
  }

  try {
    const redisClient = createClient({
      url: endpoint,
      pingInterval: 10000,
    });

    redisClient.on('error', e => {
      if (process.env.NEXT_PRIVATE_DEBUG_CACHE !== undefined) {
        console.warn('Redis error', e);
      }

      global.cacheHandlerConfig = null;
      global.cacheHandlerConfigPromise = null;
    });

    console.info('Connecting Redis client to', endpoint);
    await redisClient.connect();
    console.info('Redis client connected to', endpoint);

    if (!redisClient.isReady) {
      console.error('Failed to initialize caching layer to Redis', endpoint);
    }

    return redisClient;
  } catch (error) {
    console.warn('Failed to connect Redis client:', endpoint, error);
  }
}

/**
 * Creates a composite cache handler that uses LRU cache first, then falls back to Redis.
 * If a value is found in Redis, it populates the LRU cache for future requests.
 * @param options
 * @returns LRU + Redis composite cache handler
 */
function createLRURedisHandler(options) {
  const lruHandler = options.lruHandler;
  const redisReadHandler = options.redisReadHandler;
  const redisWriteHandler = options.redisWriteHandler;

  return {
    name: 'lru-redis',
    /**
     * Retrieves a value from the cache. Checks LRU first, then Redis.
     * @param key - The cache key.
     * @param ctx - The request context.
     * @returns - The cached value or null if not found.
     */
    async get(key, ctx) {
      // Check LRU first
      const lruResult = await lruHandler.get(key, ctx);
      if (lruResult !== null) {
        return lruResult;
      }

      // Fallback to Redis on miss
      const redisResult = await redisReadHandler.get(key, ctx);
      if (redisResult !== null) {
        // Auto-populate LRU if found in Redis
        await lruHandler.set(key, redisResult);
        return redisResult;
      }

      // Miss in both
      return null;
    },
    /**
     * Sets a value in the cache.
     * @param key - The cache key.
     * @param value - The cache value.
     */
    async set(key, value) {
      await Promise.all([
        lruHandler.set(key, value),
        redisWriteHandler.set(key, value),
      ]);
    },
    /**
     * Revalidates a cache entry by its tag.
     * @param tag - The cache tag.
     */
    async revalidateTag(tag) {
      await Promise.all([
        lruHandler.revalidateTag(tag),
        redisWriteHandler.revalidateTag(tag),
      ]);
    },
    /**
     * Deletes a cache entry.
     * @param key - The cache key.
     */
    async delete(key) {
      await Promise.all([
        lruHandler.delete(key),
        redisWriteHandler.delete(key),
      ]);
    },
  };
}

/**
 * Creates a cache configuration.
 * @returns {Promise<CacheHandlerConfig>} - The cache handler configuration.
 */
async function createCacheConfig() {
  const redisWriteClient = await setupRedisClient(process.env.REDIS_WRITE_URL);
  const redisReadClient = await setupRedisClient(process.env.REDIS_READ_URL);
  const lruCache = createLruHandler();

  // If no Redis, (e.g. Redis is down), use LRU only to avoid latency and downtime.
  if (!redisReadClient || !redisWriteClient) {
    console.debug(
      `Using LRU cache only as Redis is not configured or unavailable.`,
    );
    const config = {handlers: [lruCache]};
    global.cacheHandlerConfigPromise = null;
    global.cacheHandlerConfig = config;

    return config;
  }

  const redisReadCacheHandler = createRedisHandler({
    client: redisReadClient,
    keyPrefix: 'marketing-sites:::',
  });

  const redisWriteCacheHandler = createRedisHandler({
    client: redisWriteClient,
    keyPrefix: 'marketing-sites:::',
  });

  const config = {
    handlers: [
      createLRURedisHandler({
        lruHandler: lruCache,
        redisReadHandler: redisReadCacheHandler,
        redisWriteHandler: redisWriteCacheHandler,
      }),
    ],
  };

  // Ensure singleton pattern for cache handler config to avoid multiple Redis connections.
  global.cacheHandlerConfigPromise = null;
  global.cacheHandlerConfig = config;

  return config;
}

CacheHandler.onCreation(() => {
  // Ensure singleton pattern for cache handler config to avoid multiple Redis connections.
  if (global.cacheHandlerConfig) {
    return global.cacheHandlerConfig;
  }
  if (global.cacheHandlerConfigPromise) {
    return global.cacheHandlerConfigPromise;
  }

  const promise = createCacheConfig();
  global.cacheHandlerConfigPromise = promise;

  return promise;
});

export default CacheHandler;
