import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CacheHelperService } from '../../common/cache/cache-helper.service';
import { GetProductsDto } from './dto/get-product.dto';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: Repository<Product>;
  let cacheHelper: jest.Mocked<CacheHelperService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
        {
          provide: CacheHelperService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            deleteByPattern: jest.fn(),
          },
        },
      ],
    }).compile();
    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    cacheHelper = module.get<CacheHelperService>(CacheHelperService) as jest.Mocked<CacheHelperService>;
  });

  describe('create', () => {
    it('should create a new product and set cache', async () => {
      const dto: CreateProductDto = { name: 'Product A', description: 'Description A', price: 100 };
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(productsRepository, 'create').mockImplementation((product) => product as Product);
      jest.spyOn(productsRepository, 'save').mockImplementation(
        async (product) =>
          ({
            ...product,
            id: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
          }) as Product,
      );

      const findOneSpy = jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);
      const createSpy = jest.spyOn(productsRepository, 'create').mockImplementation((product) => product as Product);
      const setCacheSpy = jest.spyOn(cacheHelper, 'deleteByPattern').mockResolvedValue();

      const result = await productsService.create(dto);

      expect(result).toHaveProperty('id');
      expect(setCacheSpy).toHaveBeenCalledWith('products:list*');

      expect(findOneSpy).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(createSpy).toHaveBeenCalled();
      // expect(saveSpy).toHaveBeenCalled();

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
    it('should return paginated products and use cache', async () => {
      const dto: PaginationQueryDto = { limit: 2, offset: 0 };
      const products: Product[] = [
        {
          id: '1',
          name: 'Product A',
          description: 'Desc A',
          price: 100,
          stock: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          cartItems: [],
        },
        {
          id: '2',
          name: 'Product B',
          description: 'Desc B',
          price: 200,
          stock: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          cartItems: [],
        },
      ];

      jest.spyOn(cacheHelper, 'get').mockResolvedValue(null);
      jest.spyOn(productsRepository, 'findAndCount').mockResolvedValue([products, 5]);
      const setCacheSpy = jest.spyOn(cacheHelper, 'set').mockResolvedValue();

      const result = await productsService.findAll(dto);

      expect(result.data).toEqual(products);
      expect(result.total).toBe(5);
      expect(result.limit).toBe(dto.limit);
      expect(result.offset).toBe(dto.offset);
      expect(setCacheSpy).toHaveBeenCalled();
      expect(result.data).toEqual(products);
    });
    it('should return filtered products by name', async () => {
      const dto: PaginationQueryDto = { limit: 2, offset: 0 };
      const nameFilterDto: GetProductsDto = { ...dto, name: 'Product A' };
      const products: Product[] = [
        {
          id: '1',
          name: 'Product A',
          description: 'Desc A',
          price: 100,
          stock: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          cartItems: [],
        },
      ];
      jest.spyOn(cacheHelper, "get").mockResolvedValue(null);
      jest.spyOn(productsRepository, 'findAndCount').mockResolvedValue([products, 1]);
      const setCacheSpy = jest.spyOn(cacheHelper, "set").mockResolvedValue();
      const result = await productsService.findAll(nameFilterDto);
      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(dto.limit);
      expect(result.offset).toBe(dto.offset);
      expect(setCacheSpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id and cache it', async () => {
      const product: Product = {
        id: '1',
        name: 'Product A',
        description: 'Desc A',
        price: 100,
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(cacheHelper, 'get').mockResolvedValue(null);
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(product);
      const setCacheSpy = jest.spyOn(cacheHelper, 'set').mockResolvedValue();

      const result = await productsService.findOne('1');

      expect(result).toEqual(product);
      expect(setCacheSpy).toHaveBeenCalledWith('products:detail:1', product, expect.any(Number));
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);

      await expect(productsService.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product and clear cache', async () => {
      const existing: Product = {
        id: '1',
        name: 'Product A',
        description: 'Desc A',
        price: 100,
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updateDto: UpdateProductDto = { name: 'Product A Updated', price: 150 };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(existing);
      jest.spyOn(productsRepository, 'save').mockResolvedValue({ ...existing, ...updateDto } as Product);
      const deleteCacheSpy = jest.spyOn(cacheHelper, 'deleteByPattern').mockResolvedValue();
      const delCacheSpy = jest.spyOn(cacheHelper, 'del').mockResolvedValue();

      const result = await productsService.update('1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.price).toBe(updateDto.price);
      expect(deleteCacheSpy).toHaveBeenCalledWith('products:list*');
      expect(delCacheSpy).toHaveBeenCalledWith('products:detail:1');
    });

    it('should throw NotFoundException if product to update not found', async () => {
      const updateDto: UpdateProductDto = { name: 'Product A Updated', price: 150 };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);

      await expect(productsService.update('1', updateDto)).rejects.toThrow(NotFoundException);
    });
  });
  describe('delete', () => {
    it('should delete a product by id', async () => {
      const existingProduct: Product = {
        id: '1',
        name: 'Product A',
        description: 'Desc A',
        price: 100,
        stock: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(existingProduct);
      const removeSpy = jest.spyOn(productsRepository, 'remove').mockResolvedValue(existingProduct);

      await productsService.delete('1');

      expect(productsRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(removeSpy).toHaveBeenCalledWith(existingProduct);
    });

    it('should throw NotFoundException if product to delete not found', async () => {
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(null);

      await expect(productsService.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
