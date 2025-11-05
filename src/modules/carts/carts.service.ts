import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { User } from '../users/entities/user.entity';
import { CartItemResponseDto } from '../cart-items/dto/cart-item-response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginationMeta } from '../../common/interfaces/pagination-meta.interface';
import { CacheHelperService } from '../../common/cache/cache-helper.service';
import { CACHE_TTL } from '../../common/constants/cache.constant';
import { ERROR_MESSAGE } from '../../common/constants/error.constant';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly cacheHelper: CacheHelperService, // ✅ inject cache helper
  ) {}

  private getCartCacheKey(userId: string, limit: number, offset: number) {
    return `cart:${userId}:items:${limit}:${offset}`;
  }

  async addItem(user: User, dto: AddCartItemDto): Promise<CartItemResponseDto> {
    const { productId, quantity } = dto;

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(ERROR_MESSAGE.PRODUCT_NOT_FOUND(productId));

    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ user, items: [] });
      await this.cartRepo.save(cart);
    }

    const existingItem = cart.items.find((i) => i.product.id === productId);

    let savedItem: CartItem;

    if (existingItem) {
      existingItem.quantity += quantity;
      savedItem = await this.cartItemRepo.save(existingItem);
    } else {
      const newItem = this.cartItemRepo.create({ cart, product, quantity });
      savedItem = await this.cartItemRepo.save(newItem);
    }

    // Invalidate cart caches for this user
    await this.cacheHelper.deleteByPattern(`cart:${user.id}:items:*`);

    return plainToInstance(
      CartItemResponseDto,
      {
        id: savedItem.id,
        userId: user.id,
        productId: product.id,
        quantity: savedItem.quantity,
        createdAt: savedItem.createdAt,
        updatedAt: savedItem.updatedAt,
      },
      { excludeExtraneousValues: true },
    );
  }

  async removeItem(user: User, cartItemId: string): Promise<void> {
    const item = await this.cartItemRepo.findOne({
      where: { id: cartItemId },
      relations: ['cart', 'cart.user'],
    });

    if (!item) {
      throw new NotFoundException(ERROR_MESSAGE.CART_ITEM_NOT_FOUND);
    }

    // Ensure item belongs to this user
    if (item.cart.user.id !== user.id) {
      throw new ForbiddenException(ERROR_MESSAGE.PERMISSION_DENIED);
    }

    await this.cartItemRepo.remove(item);
    // Invalidate cart caches for this user
    await this.cacheHelper.deleteByPattern(`cart:${user.id}:items:*`);
  }

  async getCartItems(
    user: User,
    pagination: PaginationQueryDto,
  ): Promise<{ data: CartItemResponseDto[]; pagination: PaginationMeta }> {
    const { limit = 10, offset = 0 } = pagination;
    const cacheKey = this.getCartCacheKey(user.id, limit, offset);

    // Try cache first
    const cached = await this.cacheHelper.get<{
      data: CartItemResponseDto[];
      pagination: PaginationMeta;
    }>(cacheKey);

    if (cached) {
      console.log(`Returning cart items for user ${user.id} from cache`);
      return cached;
    }

    // If no cache, query database
    const cart = await this.cartRepo.findOne({ where: { user: { id: user.id } } });
    if (!cart) {
      return { data: [], pagination: { total: 0, limit, offset } };
    }

    const [items, total] = await this.cartItemRepo.findAndCount({
      where: { cart: { id: cart.id } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const data = plainToInstance(
      CartItemResponseDto,
      items.map((item) => ({
        id: item.id,
        userId: user.id,
        productId: item.product.id,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      { excludeExtraneousValues: true },
    );

    const result = { data, pagination: { total, limit, offset } };

    console.log(`Returning cart items for user ${user.id} from database`);

    // Cache the result for CACHE_TTL seconds
    await this.cacheHelper.set(cacheKey, result, CACHE_TTL);

    return result;
  }
}
