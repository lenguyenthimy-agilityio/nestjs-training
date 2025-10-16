import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from './utils/test-app.factory';
import { UsersService } from '../src/users/users.service';

describe('Auth E2E (Mocked)', () => {
  let app: INestApplication;
  let mockUsersService: Partial<UsersService>;

  beforeAll(async () => {
    mockUsersService = {
      findOneByUsername: jest.fn(async (username: string) => {
        if (username === 'john') {
          // Password hash for 'changeme'
          const hashed = await bcrypt.hash('changeme', 10);
          return { id: 1, username: 'john', password: hashed, role: 'user' };
        }
        return null;
      }),
    };

    app = await createTestApp([{ provide: UsersService, useValue: mockUsersService }]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return JWT token when login succeeds', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);
    console.log('Login Response Body:', response.body); // Debugging line
    expect(response.body.access_token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    // mockUsersService.findOneByUsername = jest.fn().mockResolvedValueOnce(null);

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
