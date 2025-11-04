import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CacheHelperService } from '../../common/cache/cache-helper.service';

describe('CartsService (with caching)', () => {
  let service: CartsService;
  let cartRepo: jest.Mocked<Repository<Cart>>;
  let cartItemRepo: jest.Mocked<Repository<CartItem>>;
  let productRepo: jest.Mocked<Repository<Product>>;
  let cacheHelper: jest.Mocked<CacheHelperService>;

  const mockUser: User = { id: 'user-1' } as User;
  const mockProduct: Product = { id: 'product-1', name: 'Test Product' } as Product;
  const mockCart: Cart = { id: 'cart-1', user: mockUser, items: [] } as unknown as Cart;
  const mockCartItem: CartItem = {
    id: 'item-1',
    cart: mockCart,
    product: mockProduct,
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as CartItem;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        { provide: getRepositoryToken(Cart), useValue: createMockRepo() },
        { provide: getRepositoryToken(CartItem), useValue: createMockRepo() },
        { provide: getRepositoryToken(Product), useValue: createMockRepo() },
        {
          provide: CacheHelperService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            deleteByPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    cartRepo = module.get(getRepositoryToken(Cart));
    cartItemRepo = module.get(getRepositoryToken(CartItem));
    productRepo = module.get(getRepositoryToken(Product));
    cacheHelper = module.get(CacheHelperService);
  });

  function createMockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
  }

  // ────────────────────────────────
  // addItem()
  // ────────────────────────────────
  describe('addItem', () => {
    it('should throw NotFoundException if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.addItem(mockUser, { productId: 'p1', quantity: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should create a new cart if not found and invalidate cache', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      cartRepo.findOne.mockResolvedValue(null);
      cartRepo.create.mockReturnValue(mockCart);
      cartRepo.save.mockResolvedValue(mockCart);
      cartItemRepo.create.mockReturnValue(mockCartItem);
      cartItemRepo.save.mockResolvedValue(mockCartItem);

      const dto: AddCartItemDto = { productId: 'product-1', quantity: 2 };
      const result = await service.addItem(mockUser, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(cacheHelper.deleteByPattern).toHaveBeenCalledWith(`cart:${mockUser.id}:items:*`);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(cartRepo.create).toHaveBeenCalledWith({ user: mockUser, items: [] });
      expect(result).toHaveProperty('productId', 'product-1');
    });

    it('should increase quantity if product exists in cart and invalidate cache', async () => {
      const existingItem = { ...mockCartItem };
      const existingCart = { ...mockCart, items: [existingItem] };
      productRepo.findOne.mockResolvedValue(mockProduct);
      cartRepo.findOne.mockResolvedValue(existingCart);
      cartItemRepo.save.mockResolvedValue({ ...existingItem, quantity: 3 });

      const dto: AddCartItemDto = { productId: 'product-1', quantity: 1 };
      const result = await service.addItem(mockUser, dto);

      expect(cacheHelper.deleteByPattern).toHaveBeenCalledWith(`cart:${mockUser.id}:items:*`);
      expect(result.quantity).toBe(3);
    });
  });

  // ────────────────────────────────
  // removeItem()
  // ────────────────────────────────
  describe('removeItem', () => {
    it('should throw NotFoundException if item not found', async () => {
      cartItemRepo.findOne.mockResolvedValue(null);
      await expect(service.removeItem(mockUser, 'item-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if item does not belong to user', async () => {
      const otherUser = { id: 'other-user' } as User;
      const item = { ...mockCartItem, cart: { user: otherUser } as Cart };
      cartItemRepo.findOne.mockResolvedValue(item);

      await expect(service.removeItem(mockUser, 'item-1')).rejects.toThrow(ForbiddenException);
    });

    it('should remove item if user owns it and invalidate cache', async () => {
      const item = { ...mockCartItem, cart: { user: mockUser } as Cart };
      cartItemRepo.findOne.mockResolvedValue(item);
      cartItemRepo.remove.mockResolvedValue(item);

      await service.removeItem(mockUser, 'item-1');

      expect(cartItemRepo.remove).toHaveBeenCalledWith(item);
      expect(cacheHelper.deleteByPattern).toHaveBeenCalledWith(`cart:${mockUser.id}:items:*`);
    });
  });

  // ────────────────────────────────
  // getCartItems()
  // ────────────────────────────────
  describe('getCartItems', () => {
    const pagination = { limit: 10, offset: 0 };

    it('should return cached data if available', async () => {
      const cached = { data: [mockCartItem], pagination: { total: 1, limit: 10, offset: 0 } };
      cacheHelper.get.mockResolvedValue(cached);

      const result = await service.getCartItems(mockUser, pagination);
      expect(result).toEqual(cached);
      expect(cacheHelper.get).toHaveBeenCalledWith(`cart:${mockUser.id}:items:10:0`);
    });

    it('should return empty array if cart not found and cache empty', async () => {
      cacheHelper.get.mockResolvedValue(null);
      cartRepo.findOne.mockResolvedValue(null);
      const result = await service.getCartItems(mockUser, pagination);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should return paginated cart items and cache them', async () => {
      cacheHelper.get.mockResolvedValue(null);
      cartRepo.findOne.mockResolvedValue(mockCart);
      cartItemRepo.findAndCount.mockResolvedValue([[mockCartItem], 1]);

      const result = await service.getCartItems(mockUser, pagination);

      expect(result.data.length).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(cacheHelper.set).toHaveBeenCalledWith(`cart:${mockUser.id}:items:10:0`, result, expect.any(Number));
    });
  });
});
