import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheHelperService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async set(key: string, value: any, ttlSeconds?: number) {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async del(key: string): Promise<number> {
    const result = await this.redisClient.del(key);
    return result;
  }

  /**
   * Delete all keys matching a pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length === 0) {
      console.log(`[CACHE] No keys matched pattern: ${pattern}`);
      return;
    }
    await this.redisClient.del(...keys);
    console.log(`[CACHE] Deleted ${keys.length} keys matching: ${pattern}`);
  }

  async keys(pattern = '*'): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }
}
