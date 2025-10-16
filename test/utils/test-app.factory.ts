// test/utils/test-app.factory.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export async function createTestApp(overrides: { provide: any; useValue: any }[] = []): Promise<INestApplication> {
  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Apply any overrides provided by caller
  for (const override of overrides) {
    moduleBuilder.overrideProvider(override.provide).useValue(override.useValue);
  }

  const moduleRef: TestingModule = await moduleBuilder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
