// test/auth.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockUsersService } from './utils/test-app.factory';

describe('Auth E2E (Mocked)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return JWT token when login succeeds', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);

    expect(response.body.access_token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    mockUsersService.findOneByUsername.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'wrong', password: 'nope' })
      .expect(401);

    expect(response.body.message).toContain('Unauthorized');
  });

  it('should get user profile with valid token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);

    const token = loginResponse.body.access_token;

    const profileResponse = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log('Profile Response Body:', profileResponse.body); // Debugging line
    expect(profileResponse.body).toEqual({
      sub: 1,
      username: 'john',
      role: 'user',
    });
  });

  it('should reject profile access with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401);

    expect(response.body.message).toContain('Unauthorized');
  });
});
