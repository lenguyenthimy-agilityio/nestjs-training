import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createTestingApp } from './jest.setup';
import { Role } from '../src/modules/users/enums/role.enum';
import { User } from '../src/modules/users/entities/user.entity';
import Redis from 'ioredis';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let redisClient: Redis;
  let server: any;
  let adminToken: string;
  let userToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    const setup = await createTestingApp();
    app = setup.app;
    redisClient = setup.redisClient;
    server = app.getHttpServer();
    dataSource = app.get(DataSource);

    const userRepo = dataSource.getRepository(User);

    // Create and promote admin
    await request(server).post('/auth/signup').send({ email: 'admin@example.com', password: 'Abcd@1234' }).expect(201);

    await userRepo.update({ email: 'admin@example.com' }, { role: Role.ADMIN });

    // Login as admin
    const adminLogin = await request(server)
      .post('/auth/signin')
      .send({ email: 'admin@example.com', password: 'Abcd@1234' })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    adminToken = adminLogin.body.access_token;

    // Create a normal user
    await request(server).post('/auth/signup').send({ email: 'user@example.com', password: 'Abcd@1234' }).expect(201);

    // Login as normal user
    const userLogin = await request(server)
      .post('/auth/signin')
      .send({ email: 'user@example.com', password: 'Abcd@1234' })
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    if (redisClient && redisClient.status === 'ready') {
      console.log('Closing Redis connection...');
      await redisClient.quit();
    }

    await dataSource.destroy();
    await app.close();
  });

  // ✅ Admin creates a product
  it('should allow admin to create a product', async () => {
    const res = await request(server)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'T-Shirt',
        description: 'A cool cotton t-shirt',
        price: 19.99,
        stock: 100,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'T-Shirt',
      description: 'A cool cotton t-shirt',
      price: 19.99,
      stock: 100,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    createdProductId = res.body.id;

    expect(res.body).toHaveProperty('id');
  });

  // Normal user cannot create a product
  it('should forbid normal user from creating a product', async () => {
    await request(server)
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Product',
        description: 'Should not work',
        price: 9.99,
        stock: 5,
      })
      .expect(403);
  });

  // Unauthenticated user cannot create
  it('should reject unauthenticated requests', async () => {
    await request(server)
      .post('/products')
      .send({
        name: 'No Auth Product',
        description: 'No token',
        price: 15.99,
        stock: 20,
      })
      .expect(401);
  });

  // List products with pagination
  it('should list products with pagination and search', async () => {
    const res = await request(server)
      .get('/products?limit=10&offset=0&name=T-Shirt')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('offset');
  });

  // ✅ Admin updates product
  it('should allow admin to update a product', async () => {
    const updated = {
      name: 'Updated T-Shirt',
      description: 'Updated description',
      price: 25.5,
      stock: 200,
    };

    const res = await request(server)
      .patch(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updated)
      .expect(200);

    expect(res.body).toMatchObject(updated);
    expect(res.body.id).toBe(createdProductId);
  });

  // Normal user cannot update product
  it('should forbid normal user from updating a product', async () => {
    await request(server)
      .patch(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 30 })
      .expect(403);
  });

  // Admin deletes product
  it('should allow admin to delete a product', async () => {
    await request(server)
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  // Normal user cannot delete product
  it('should forbid normal user from deleting a product', async () => {
    await request(server)
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
