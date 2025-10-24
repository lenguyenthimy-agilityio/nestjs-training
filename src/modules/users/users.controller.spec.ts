// create unit tests for updateRole method in users.controller.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Role } from '../users/enums/role.enum';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateRole: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('updateRole', () => {
    it('should update the user role and return updated user data', async () => {
      const userId = '1';
      const dto: UpdateUserRoleDto = { role: Role.ADMIN };
      const updatedUser = {
        id: userId,
        email: 'example@gmail.com',
        role: Role.ADMIN,
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'updateRole').mockResolvedValue(updatedUser as any);

      const result = await usersController.updateRole(userId, dto);

      expect(usersService.updateRole).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonexistent-id';
      const dto: UpdateUserRoleDto = { role: Role.USER };

      jest.spyOn(usersService, 'updateRole').mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      await expect(usersController.updateRole(userId, dto)).rejects.toBeInstanceOf(NotFoundException);
      await expect(usersController.updateRole(userId, dto)).rejects.toThrow(`User with ID ${userId} not found`);

      expect(usersService.updateRole).toHaveBeenCalledWith(userId, dto);
    });
  });
});
