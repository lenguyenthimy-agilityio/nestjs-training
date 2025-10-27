// create unit test for ProductsService
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, Like } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const dto: CreateProductDto = { name: 'Product A', description: 'Description A', price: 100 };

      const findOneSpy = jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);
      const createSpy = jest.spyOn(productsRepository, 'create').mockImplementation((product) => product as Product);
      const saveSpy = jest.spyOn(productsRepository, 'save').mockImplementation(
        async (product) =>
          ({
            ...product,
            id: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
          }) as Product,
      );

      const result = await productsService.create(dto);

      expect(findOneSpy).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(dto.name);
      expect(result.description).toBe(dto.description);
      expect(result.price).toBe(dto.price);
    });

    it('should throw ConflictException if product name already exists', async () => {
      const dto: CreateProductDto = { name: 'Product A', description: 'Description A', price: 100 };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue({} as Product);

      await expect(productsService.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // Additional tests for findAll, findOne, and update
  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginationDto: PaginationQueryDto = { limit: 10, offset: 0 };

      const products: Product[] = [
        { id: '1', name: 'Product A', description: 'Desc A', price: 100, stock: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Product B', description: 'Desc B', price: 200, stock: 0, createdAt: new Date(), updatedAt: new Date() },
      ];

      jest.spyOn(productsRepository, 'find').mockResolvedValue(products);

      const result = await productsService.findAll(paginationDto);

      expect(productsRepository.find).toHaveBeenCalledWith({
        skip: paginationDto.offset,
        take: paginationDto.limit,
      });
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product: Product = { id: '1', name: 'Product A', description: 'Desc A', price: 100, stock: 0, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(product);

      const result = await productsService.findOne('1');

      expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);

      await expect(productsService.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const existingProduct: Product = { id: '1', name: 'Product A', description: 'Desc A', price: 100, stock: 0, createdAt: new Date(), updatedAt: new Date() };
      const updateDto: UpdateProductDto = { name: 'Product A Updated', price: 150 };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(existingProduct);
      const saveSpy = jest.spyOn(productsRepository, 'save').mockImplementation(
        async (product) => ({ ...existingProduct, ...product }) as Product,
      );

      const result = await productsService.update('1', updateDto);

      expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(saveSpy).toHaveBeenCalled();

      expect(result.name).toBe(updateDto.name);
      expect(result.price).toBe(updateDto.price);
    });

    it('should throw NotFoundException if product to update not found', async () => {
      const updateDto: UpdateProductDto = { name: 'Product A Updated', price: 150 };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);

      await expect(productsService.update('1', updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
