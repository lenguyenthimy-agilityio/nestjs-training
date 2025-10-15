import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

describe('CatsService', () => {
  let service: CatsService;
  let repo: jest.Mocked<Repository<Cat>>;

  const mockCat: Cat = { id: 1, name: 'Tom', age: 2, breed: 'Persian' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cat),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repo = module.get(getRepositoryToken(Cat));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a cat with given data', async () => {
      const dto: CreateCatDto = { name: 'Tom', age: 2, breed: 'Persian' };

      repo.create.mockImplementation(dto => ({ id: 1, ...dto }));
      repo.save.mockImplementation(cat => Promise.resolve(cat));

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      repo.find.mockResolvedValue([mockCat]);
      const result = await service.findAll();
      expect(result).toEqual([mockCat]);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('getOneCat', () => {
    it('should return a single cat if found', async () => {
      repo.findOne.mockResolvedValue(mockCat);
      const result = await service.getOneCat(1);
      expect(result).toEqual(mockCat);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if cat not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getOneCat(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCat', () => {
    it('should update and save the cat', async () => {
      const dto: UpdateCatDto = { name: 'Tommy', age: 3 };
      const updatedCat = { ...mockCat, ...dto };
      console.log('Updated Cat:', updatedCat); // Debugging line

      jest.spyOn(service, 'getOneCat').mockResolvedValue(mockCat);
      repo.save.mockResolvedValue(updatedCat);

      const result = await service.updateCat(1, dto);
      expect(service.getOneCat).toHaveBeenCalledWith(1);
      expect(repo.save).toHaveBeenCalledWith(updatedCat);
      expect(result).toEqual(updatedCat);
    });
  });

  describe('deleteCat', () => {
    it('should delete the cat', async () => {
      jest.spyOn(service, 'getOneCat').mockResolvedValue(mockCat);
      repo.remove.mockResolvedValue(undefined);

      await service.deleteCat(1);

      expect(service.getOneCat).toHaveBeenCalledWith(1);
      expect(repo.remove).toHaveBeenCalledWith(mockCat);
    });
  });
});
