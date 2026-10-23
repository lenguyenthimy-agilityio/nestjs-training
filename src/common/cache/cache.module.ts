import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import Redis from 'ioredis';
import { CacheHelperService } from './cache-helper.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          ttl: configService.get<number>('REDIS_TTL', 300),
        }),
      }),
    }),
  ],
  providers: [
    CacheHelperService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [CacheHelperService, 'REDIS_CLIENT', CacheModule],
})
export class CacheHelperModule {}
