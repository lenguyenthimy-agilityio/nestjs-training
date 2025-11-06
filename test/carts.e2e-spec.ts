import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createTestingApp } from './jest.setup';
import { Product } from '../src/modules/products/entities/product.entity';
import { CartItem } from '../src/modules/cart-items/entities/cart-item.entity';
import Redis from 'ioredis';

describe('Carts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let redisClient: Redis;
  let server: any;
  let accessToken: string;
  let testProduct: Product;

  beforeAll(async () => {
    const setup = await createTestingApp();
    app = setup.app;
    redisClient = setup.redisClient;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    server = app.getHttpServer();
    dataSource = app.get(DataSource);


    // Create a test user
    await request(server).post('/auth/signup').send({ email: 'john@example.com', password: 'Abcd@1234' }).expect(201);

    // Mock signin (if /auth/signin exists)
    const loginRes = await request(server)
      .post('/auth/signin')
      .send({ email: 'john@example.com', password: 'Abcd@1234' });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    accessToken = loginRes.body.access_token;

    // Create a product
    const productRepo = dataSource.getRepository(Product);
    testProduct = productRepo.create({
      name: 'Test Product',
      price: 99.99,
      description: 'A product for testing',
    });
    await productRepo.save(testProduct);
  });

  afterAll(async () => {
    if (redisClient && redisClient.status === 'ready') {
      console.log('Closing Redis connection...');
      await redisClient.quit();
    }

    await dataSource.destroy();
    await app.close();
  });

  describe('/carts/items (POST)', () => {
    it('should add an item to the cart', async () => {
      const res = await request(server)
        .post('/carts/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.productId).toBe(testProduct.id);
      expect(res.body.quantity).toBe(2);
    });

    it('should fail if productId is missing', async () => {
      await request(server)
        .post('/carts/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ quantity: 1 })
        .expect(400);
    });
  });

  describe('/carts/items (GET)', () => {
    it('should return all cart items with pagination', async () => {
      const res = await request(server)
        .get('/carts/items?limit=5&offset=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('offset');
    });
  });

  describe('/carts/items/:cartItemId (DELETE)', () => {
    let itemToDelete: CartItem;

    beforeAll(async () => {
      const res = await request(server)
        .post('/carts/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: testProduct.id, quantity: 1 })
        .expect(201);

      // response body is typed as any by supertest; assert to CartItem and suppress lint rule
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemToDelete = res.body as CartItem;
    });

    it('should delete a cart item', async () => {
      await request(server)
        .delete(`/carts/items/${itemToDelete.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const cartItemRepo = dataSource.getRepository(CartItem);
      const found = await cartItemRepo.findOne({ where: { id: itemToDelete.id } });
      expect(found).toBeNull();
    });

    // Attempt to delete non-existing item
    it('should return 404 when deleting non-existing cart item', async () => {
      await request(server)
        .delete('/carts/items/non-existing-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    // Attempt to delete item belonging to another user
    it('should return 403 when deleting cart item of another user', async () => {
      // Create another cart item owned by the first user
      const res = await request(server)
        .post('/carts/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: testProduct.id, quantity: 1 })
        .expect(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const anotherUsersItemId = res.body.id;

      // Create another user
      await request(server)
        .post('/auth/signup')
        .send({ email: 'another@email.com', password: 'Abcd@1234' })
        .expect(201);

      const loginRes = await request(server)
        .post('/auth/signin')
        .send({ email: 'another@email.com', password: 'Abcd@1234' })
        .expect(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const anotherToken = loginRes.body.access_token;

      // Attempt to delete with another user
      await request(server)
        .delete(`/carts/items/${anotherUsersItemId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(403);
    });
  });
});
