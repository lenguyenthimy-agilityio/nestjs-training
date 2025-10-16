import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';

describe('Cats E2E (authenticated)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // get user repository from DI container
    const userRepo = moduleRef.get(getRepositoryToken(User));

    // create test user manually
    const hashed = await bcrypt.hash('changeme', 10);
    await userRepo.save({
      username: 'john',
      password: hashed,
      role: 'admin',
    });

    // now login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' });

    jwtToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/cats (POST)', async () => {
    return request(app.getHttpServer())
      .post('/cats')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ name: 'Kitty', age: 2, breed: 'Siamese' })
      .expect(201);
  });

  it('/cats (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/cats').set('Authorization', `Bearer ${jwtToken}`).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
