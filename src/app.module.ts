import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { CartsModule } from './modules/carts/carts.module';
import { CartItemsModule } from './modules/cart-items/cart-items.module';
import { ProductsModule } from './modules/products/products.module';
import { RolesGuard } from './modules/users/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CacheHelperModule } from './common/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CartsModule,
    CartItemsModule,
    ProductsModule,
    CacheHelperModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
