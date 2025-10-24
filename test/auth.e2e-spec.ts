import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from './jest.setup';

describe('Auth E2E (SQLite)', () => {
  let app: INestApplication;

  const user = { email: 'test@example.com', password: 'Abcd@1234' };

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer()).post('/auth/signup').send(user).expect(201);

    expect(res.body).toHaveProperty('email', user.email);
    expect(res.body).not.toHaveProperty('password'); // @Exclude() should hide password
  });

  it('should not allow duplicate email', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).post('/auth/signup').send(user).expect(409);
  });

  it('should login successfully and return JWT token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer()).post('/auth/signin').send(user).expect(200);

    expect(res.body).toHaveProperty('access_token');
  });

  it('should reject login with invalid password', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'example@gmail.com', password: 'wrongPassword' })
      .expect(401);
  });

  it('should reject invalid email format', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'invalid-email', password: 'Abcd@1234' })
      .expect(400);
  });
});
