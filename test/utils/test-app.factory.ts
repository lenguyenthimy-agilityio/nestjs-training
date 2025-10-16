// test/utils/test-app.factory.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/users/users.service';
import * as bcrypt from 'bcrypt';

export const mockUsersService = {
  findOneByUsername: jest.fn(async (username: string) => {
    if (username === 'john') {
      // Password hash for 'changeme'
      const hashed = await bcrypt.hash('changeme', 10);
      return {
        id: 1,
        username: 'john',
        password: hashed,
        role: 'user',
      };
    }
    return null;
  }),
};

export async function createTestApp() {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(UsersService)
    .useValue(mockUsersService)
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
