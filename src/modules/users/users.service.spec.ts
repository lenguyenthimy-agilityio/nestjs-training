import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from '../auth/dto/signup.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;
  let hashProvider: { hash: jest.Mock; compare: jest.Mock };

  beforeEach(async () => {
    hashProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: 'HASH_PROVIDER',
          useValue: hashProvider,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const dto: SignupDto = { email: 'example@gmail.com', password: 'password' };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersRepository, 'create').mockImplementation((user) => user as User);
      jest.spyOn(usersRepository, 'save').mockImplementation(
        async (user) =>
          ({
            ...user,
            id: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
          }) as User,
      );

      hashProvider.hash.mockResolvedValue('hashedPassword123');

      const result = await usersService.create(dto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(hashProvider.hash).toHaveBeenCalledWith(dto.password);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(dto.email);
      expect(result.password).toBe('hashedPassword123');
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: SignupDto = { email: 'example@gmail.com', password: 'password' };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({
        id: '1',
        email: dto.email,
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);

      await expect(usersService.create(dto)).rejects.toThrow(ConflictException);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'example@gmail.com';

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({
        id: '1',
        email,
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);

      const result = await usersService.findByEmail(email);
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      const email = 'example@gmail.com';
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await usersService.findByEmail(email);
      expect(result).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update the user role', async () => {
      const userId = '1';
      const dto: UpdateUserRoleDto = { role: 'admin' } as unknown as UpdateUserRoleDto;

      const existingUser = {
        id: userId,
        email: 'example@gmail.com',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(existingUser);
      jest.spyOn(usersRepository, 'save').mockImplementation(async (user) => user as User);

      const result = await usersService.updateRole(userId, dto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result.role).toBe(dto.role);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '1';
      const dto: UpdateUserRoleDto = { role: 'ADMIN' };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.updateRole(userId, dto)).rejects.toBeInstanceOf(NotFoundException);
      await expect(usersService.updateRole(userId, dto)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([
        {
          id: '1',
          email: 'example@gmail.com',
          password: 'hashedPassword',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User,
      ]);

      const result = await usersService.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });
});
