import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { User } from '../users/entities/user.entity';

describe('CartsController', () => {
  let controller: CartsController;
  let service: CartsService;

  const mockUser: User = { id: 'user-1' } as User;

  const mockCartItemResponse = {
    id: 'item-1',
    userId: mockUser.id,
    productId: 'product-1',
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginationResponse = {
    data: [mockCartItemResponse],
    pagination: { total: 1, limit: 10, offset: 0 },
  };

  const mockCartsService = {
    addItem: jest.fn(),
    removeItem: jest.fn(),
    getCartItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [{ provide: CartsService, useValue: mockCartsService }],
    }).compile();

    controller = module.get<CartsController>(CartsController);
    service = module.get<CartsService>(CartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ────────────────────────────────
  // addItem()
  // ────────────────────────────────
  describe('addItem', () => {
    it('should call cartsService.addItem with user and dto', async () => {
      const dto: AddCartItemDto = { productId: 'product-1', quantity: 2 };
      const req = { user: mockUser };
      mockCartsService.addItem.mockResolvedValue(mockCartItemResponse);

      const result = await controller.addItem(req, dto);

      expect(service.addItem).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toEqual(mockCartItemResponse);
    });
  });

  // ────────────────────────────────
  // removeItem()
  // ────────────────────────────────
  describe('removeItem', () => {
    it('should call cartsService.removeItem with user and cartItemId', async () => {
      const req = { user: mockUser };
      const cartItemId = 'item-1';
      mockCartsService.removeItem.mockResolvedValue(undefined);

      await controller.removeItem(req, cartItemId);

      expect(service.removeItem).toHaveBeenCalledWith(mockUser, cartItemId);
    });
  });

  // ────────────────────────────────
  // getCartItems()
  // ────────────────────────────────
  describe('getCartItems', () => {
    it('should call cartsService.getCartItems and return data', async () => {
      const req = { user: mockUser };
      const query: PaginationQueryDto = { limit: 10, offset: 0 };
      mockCartsService.getCartItems.mockResolvedValue(mockPaginationResponse);

      const result = await controller.getCartItems(req, query);

      expect(service.getCartItems).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(mockPaginationResponse);
    });
  });
});
