import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(query: GetProductsDto) {
    const { limit, offset, name } = query;

    const where = name ? { name: Like(`%${name}%`) } : {};

    const [items, total] = await this.productRepository.findAndCount({
      where,
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);
  }
}
