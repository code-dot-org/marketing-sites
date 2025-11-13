import {RedisStringsHandler} from '@trieb.work/nextjs-turbo-redis-cache';

/**
 * @typedef {import('@trieb.work/nextjs-turbo-redis-cache').RedisStringsHandler} RedisStringsHandler
 */
class RedisCacheHandler {
  static #instance = null;
  writeCachedHandler;
  readCachedHandler;

  constructor() {
    if (RedisCacheHandler.#instance) {
      return RedisCacheHandler.#instance;
    }
    RedisCacheHandler.#instance = this;

    const isRedisCacheEnabled =
      process.env.REDIS_READ_URL &&
      process.env.REDIS_WRITE_URL &&
      process.env.NODE_ENV === 'production';

    if (isRedisCacheEnabled) {
      console.debug(`Using Redis cache`);
      this.writeCachedHandler = this.createCacheHandler(
        process.env.REDIS_WRITE_URL,
      );
      this.readCachedHandler = this.createCacheHandler(
        process.env.REDIS_READ_URL,
      );
    } else {
      console.warn('Redis cache disabled, using no-op handler');
      // Create a no-op handler if Redis is disabled
      this.readCachedHandler = {
        get: async () => null,
        set: async () => {},
        revalidateTag: async () => {},
        resetRequestCache: async () => {},
      };
      this.writeCachedHandler = {
        get: async () => null,
        set: async () => {},
        revalidateTag: async () => {},
        resetRequestCache: async () => {},
      };
    }
  }

  createCacheHandler(endpoint) {
    return new RedisStringsHandler({
      database: 0,
      keyPrefix: 'marketing-sites::',
      sharedTagsKey: '__sharedTags__',
      redisUrl: endpoint,
      // Enable TLS if the endpoint starts with 'rediss://'
      ...(endpoint.startsWith('rediss://')
        ? {
            socketOptions: {
              tls: true,
            },
          }
        : undefined),
    });
  }

  /**
   * @param {...Parameters<RedisStringsHandler['get']>} args
   * @returns {ReturnType<RedisStringsHandler['get']>}
   */
  get(...args) {
    return this.readCachedHandler.get(...args);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['set']>} args
   * @returns {ReturnType<RedisStringsHandler['set']>}
   */
  set(...args) {
    return this.writeCachedHandler.set(...args);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['revalidateTag']>} args
   * @returns {ReturnType<RedisStringsHandler['revalidateTag']>}
   */
  revalidateTag(...args) {
    return Promise.all([
      this.readCachedHandler.revalidateTag(...args),
      this.writeCachedHandler.revalidateTag(...args),
    ]);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['resetRequestCache']>} args
   * @returns {ReturnType<RedisStringsHandler['resetRequestCache']>}
   */
  resetRequestCache(...args) {
    return Promise.all([
      this.readCachedHandler.resetRequestCache(...args),
      this.writeCachedHandler.resetRequestCache(...args),
    ]);
  }
}

export default RedisCacheHandler;
