// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import databaseConfig from './config/database.config';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    // Async TypeORM config using ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.pass'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true, // auto-detect entities
        synchronize: true,      // ⚠️ auto-create schema (not for production)
      }),
    }),

    CatsModule,
  ],
})
export class AppModule {}
