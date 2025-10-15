import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  const mockCatsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getOneCat: jest.fn(),
    updateCat: jest.fn(),
    deleteCat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: mockCatsService,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new cat', async () => {
      const dto: CreateCatDto = { name: 'Tom', age: 2, breed: 'Persian' };
      const result: Cat = { id: 1, ...dto };

      mockCatsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result: Cat[] = [
        { id: 1, name: 'Tom', age: 2, breed: 'Persian' },
        { id: 2, name: 'Kitty', age: 3, breed: 'Siamese' },
      ];

      mockCatsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one cat', async () => {
      const result: Cat = { id: 1, name: 'Tom', age: 2, breed: 'Persian' };
      mockCatsService.getOneCat.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(service.getOneCat).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const dto: UpdateCatDto = { name: 'Tommy', age: 3 };
      const result: Cat = { id: 1, name: 'Tommy', age: 3, breed: 'Persian' };

      mockCatsService.updateCat.mockResolvedValue(result);

      expect(await controller.update(1, dto)).toEqual(result);
      expect(service.updateCat).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a cat', async () => {
      mockCatsService.deleteCat.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.deleteCat).toHaveBeenCalledWith(1);
    });
  });
});
