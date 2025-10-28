// create unit test for products.controller.ts findAll method with name filter
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-product.dto';
import { Product } from './entities/product.entity';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return filtered products by name', async () => {
      const dto: GetProductsDto = { name: 'Test', limit: 10, offset: 0 };
      const result = {
        data: [
          { id: '1', name: 'Test Product 1', description: 'Desc 1', price: 100 } as Product,
          { id: '2', name: 'Test Product 2', description: 'Desc 2', price: 200 } as Product,
        ],
        total: 2,
        limit: 10,
        offset: 0,
      };

      jest.spyOn(productsService, 'findAll').mockResolvedValue(result);

      expect(await productsController.findAll(dto)).toBe(result);
      expect(productsService.findAll).toHaveBeenCalledWith(dto);
    });
  });

  describe('delete', () => {
    it('should call productsService.delete with the correct id', async () => {
      const deleteSpy = jest.spyOn(productsService, 'delete').mockResolvedValue();

      const productId = '12345';
      await productsController.delete(productId);

      expect(deleteSpy).toHaveBeenCalledWith(productId);
    });
  });

  describe('create', () => {
    it('should call productsService.create with the correct dto', async () => {
      const dto = { name: 'New Product', description: 'New Description', price: 150 };
      const createdProduct = { id: '1', ...dto } as Product;

      const createSpy = jest.spyOn(productsService, 'create').mockResolvedValue(createdProduct);

      const result = await productsController.create(dto);

      expect(createSpy).toHaveBeenCalledWith(dto);
      expect(result).toBe(createdProduct);
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with the correct id', async () => {
      const productId = '12345';
      const foundProduct = {
        id: productId,
        name: 'Found Product',
        description: 'Found Description',
        price: 200,
      } as Product;

      const findOneSpy = jest.spyOn(productsService, 'findOne').mockResolvedValue(foundProduct);

      const result = await productsController.findOne(productId);

      expect(findOneSpy).toHaveBeenCalledWith(productId);
      expect(result).toBe(foundProduct);
    });
  });

  describe('update', () => {
    it('should call productsService.update with the correct id and dto', async () => {
      const productId = '12345';
      const dto = { name: 'Updated Product', description: 'Updated Description', price: 250 };
      const updatedProduct = { id: productId, ...dto } as Product;

      const updateSpy = jest.spyOn(productsService, 'update').mockResolvedValue(updatedProduct);

      const result = await productsController.update(productId, dto);

      expect(updateSpy).toHaveBeenCalledWith(productId, dto);
      expect(result).toBe(updatedProduct);
    });
  });
});
