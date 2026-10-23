// test/jest.setup.ts
import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

interface TestingAppSetup {
  app: INestApplication;
  redisClient: Redis;
}

export async function createTestingApp(): Promise<TestingAppSetup> {
  process.env.NODE_ENV = 'test';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Global validation and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();

  const redisClient = app.get<Redis>('REDIS_CLIENT');
  console.log('Created Redis client with status:', redisClient.status);

  return { app, redisClient };
}
