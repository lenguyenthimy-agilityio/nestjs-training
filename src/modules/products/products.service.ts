import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CacheHelperService } from '../../common/cache/cache-helper.service';
import { CACHE_TTL } from '../../common/constants/cache.constant';
import { ERROR_MESSAGE } from '../../common/constants/error.constant';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cacheHelper: CacheHelperService,
  ) {}

  private getListCacheKey(query: GetProductsDto): string {
    const { limit, offset, name } = query;
    return `products:list:${limit}:${offset}:${name ?? 'all'}`;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(ERROR_MESSAGE.PRODUCT_EXISTED);
    }

    const product = this.productRepository.create(dto);
    const saved = await this.productRepository.save(product);

    // Invalidate all cached lists
    await this.cacheHelper.deleteByPattern('products:list*');

    return saved;
  }

  async findAll(query: GetProductsDto) {
    const cacheKey = this.getListCacheKey(query);

    // Try to get cached data
    const cached = await this.cacheHelper.get<{
      data: Product[];
      total: number;
      limit: number;
      offset: number;
    }>(cacheKey);
    if (cached) {
      console.log('Returning products from cache');
      return cached;
    }

    const { limit, offset, name } = query;
    const where = name ? { name: Like(`%${name}%`) } : {};

    const [items, total] = await this.productRepository.findAndCount({
      where,
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const result = { data: items, total, limit, offset };

    await this.cacheHelper.set(cacheKey, result, CACHE_TTL);

    console.log('Returning products from database');
    return result;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `products:detail:${id}`;

    // Try cache first
    const cached = await this.cacheHelper.get<Product>(cacheKey);
    if (cached) {
      console.log(`Returning product ${id} from cache`);
      return cached;
    }

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ERROR_MESSAGE.PRODUCT_NOT_FOUND(id));
    }

    await this.cacheHelper.set(cacheKey, product, CACHE_TTL);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ERROR_MESSAGE.PRODUCT_NOT_FOUND(id));
    }

    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);

    // Invalidate related caches
    await this.cacheHelper.del(`products:detail:${id}`);
    await this.cacheHelper.deleteByPattern('products:list*');

    return updated;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ERROR_MESSAGE.PRODUCT_NOT_FOUND(id));
    }

    await this.productRepository.remove(product);

    // Invalidate caches
    await this.cacheHelper.del(`products:detail:${id}`);
    await this.cacheHelper.deleteByPattern('products:list*');
  }
}
