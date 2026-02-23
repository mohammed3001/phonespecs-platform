// src/common/redis/redis.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisService.name);
  private connected = false;

  constructor(private config: ConfigService) {
    this.init();
  }

  private async init() {
    const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    try {
      this.client = createClient({ url }) as RedisClientType;
      this.client.on('error', (e) => {
        this.connected = false;
        this.logger.warn(`Redis error: ${e.message} — falling back to no-cache mode`);
      });
      this.client.on('connect', () => {
        this.connected = true;
        this.logger.log('Redis connected');
      });
      await this.client.connect();
    } catch (e: any) {
      this.logger.warn(`Redis unavailable: ${e.message} — cache disabled`);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected || !this.client) return null;
    try { return await this.client.get(key); } catch { return null; }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch { /* silent */ }
  }

  async del(key: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try { await this.client.del(key); } catch { /* silent */ }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(keys);
    } catch { /* silent */ }
  }

  async onModuleDestroy() {
    if (this.client && this.connected) await this.client.quit();
  }
}

// ── Redis Module ──────────────────────────────────────────────
// src/common/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
