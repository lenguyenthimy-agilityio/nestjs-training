// create unit test for auth.controller.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should call authService.signUp and return the created user', async () => {
      const dto: SignupDto = { email: 'example@gmail.com', password: 'password' };
      const user: User = {
        id: '1',
        email: dto.email,
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(user);

      const result = await authController.signUp(dto);
      expect(result).toEqual(user);
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if authService.signUp fails', async () => {
      const dto: SignupDto = { email: 'example@gmail.com', password: 'password' };

      jest.spyOn(authService, 'signUp').mockRejectedValue(new Error('Sign up failed'));

      await expect(authController.signUp(dto)).rejects.toThrow('Sign up failed');
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  // unit test for signIn
  describe('signIn', () => {
    it('should call authService.signIn and return the access token', async () => {
      const user: User = {
        id: '1',
        email: 'example@gmail.com',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = { user };

      const tokenResponse = { access_token: 'jwt-token' };
      jest.spyOn(authService, 'signIn').mockResolvedValue(tokenResponse);

      const result = await authController.signIn({}, req);
      expect(result).toEqual(tokenResponse);
      expect(authService.signIn).toHaveBeenCalledWith(user);
    });

    // add error case for signIn
    it('should throw an error if authService.signIn fails', async () => {
      const user: User = {
        id: '1',
        email: 'example@gmail.com',
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = { user };

      jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Sign in failed'));

      await expect(authController.signIn({}, req)).rejects.toThrow('Sign in failed');
      expect(authService.signIn).toHaveBeenCalledWith(user);
    });
  });
});
