import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestingApp } from './jest.setup';
import { Role } from '../src/modules/users/enums/role.enum';
import { User } from '../src/modules/users/entities/user.entity';

describe('Users (e2e) - Update Role', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let server: any;
  let adminToken: string;
  let normalUserId: string;

  beforeAll(async () => {
    app = await createTestingApp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    server = app.getHttpServer();
    dataSource = app.get(DataSource);

    // Create admin user via signup
    await request(server).post('/auth/signup').send({ email: 'admin@example.com', password: 'Abcd@1234' }).expect(201);

    // Promote to admin manually
    const userRepo = dataSource.getRepository(User);
    await userRepo.update({ email: 'admin@example.com' }, { role: Role.ADMIN });

    // Login as admin
    const loginRes = await request(server)
      .post('/auth/signin')
      .send({ email: 'admin@example.com', password: 'Abcd@1234' })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    adminToken = loginRes.body.access_token;

    console.log('Admin Token:', adminToken);

    // Create a normal user
    const userRes = await request(server)
      .post('/auth/signup')
      .send({ email: 'user@example.com', password: 'Abcd@1234' })
      .expect(201);

    normalUserId = userRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ✅ Successful update by admin
  it('should allow admin to update user role', async () => {
    const res = await request(server)
      .patch(`/users/${normalUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: normalUserId,
      email: 'user@example.com',
      role: 'user',
    });
    expect(res.body).not.toHaveProperty('password');
  });

  // Invalid role format
  it('should return 400 for invalid role', async () => {
    const res = await request(server)
      .patch(`/users/${normalUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'INVALID_ROLE' })
      .expect(400);

    expect(res.body).toMatchObject({
      error: 'Bad Request',
      message: ["Role must be either 'admin' or 'user'"],
      statusCode: 400,
    });
  });

  // User not found
  it('should return 404 if user does not exist', async () => {
    const res = await request(server)
      .patch(`/users/99999/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  // Forbidden for non-admin user
  it('should forbid normal user from updating roles', async () => {
    const loginRes = await request(server)
      .post('/auth/signin')
      .send({ email: 'user@example.com', password: 'Abcd@1234' })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userToken = loginRes.body.access_token;

    await request(server)
      .patch(`/users/${normalUserId}/role`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' })
      .expect(403);
  });
});
