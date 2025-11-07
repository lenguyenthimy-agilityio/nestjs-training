import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let hashProvider: {
    hash: jest.Mock;
    compare: jest.Mock;
  };

  beforeEach(async () => {
    hashProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: 'HASH_PROVIDER',
          useValue: hashProvider, // 👈 mock injected provider
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const dto: SignupDto = { email: 'example@gmail.com', password: 'password' };
      const user: User = {
        id: '1',
        email: dto.email,
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');

      const result = await authService.signUp(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('access_token', 'jwtToken');
    });
  });

  describe('signIn', () => {
    it('should return an access token', async () => {
      const user: User = {
        id: '1',
        email: 'example@gmail.com',
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token = 'jwtToken';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.signIn(user);
      expect(result).toEqual({ access_token: token });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'example@gmail.com';
      const password = 'password';
      const user: User = {
        id: '1',
        email,
        role: Role.USER,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      hashProvider.compare.mockResolvedValue(true); // ✅ mock successful compare

      const result = await authService.validateUser(email, password);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should return null if user not found', async () => {
      const email = 'example@gmail.com';
      const password = 'password';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await authService.validateUser(email, password);
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const email = 'example@gmail.com';
      const password = 'password';
      const user: User = {
        id: '1',
        email,
        password: 'hashedPassword',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      hashProvider.compare.mockResolvedValue(false);

      const result = await authService.validateUser(email, password);
      expect(result).toBeNull();
    });
  });
});
