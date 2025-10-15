import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    username: 'john',
    password: 'hashedpassword',
    role: 'user' as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // validateUser()
  describe('validateUser', () => {
    it('should return user (without password) if password matches', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john', 'password');
      console.log('Result validateUser:', result); // Debugging line

      expect(usersService.findOneByUsername).toHaveBeenCalledWith('john');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
      expect(result).toEqual({ id: 1, username: 'john', role: 'user' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      usersService.findOneByUsername.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'password');

      expect(result).toBeNull();
      expect(usersService.findOneByUsername).toHaveBeenCalledWith('unknown');
    });

    it('should return null if password does not match', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john', 'wrong');

      expect(result).toBeNull();
    });
  });

  // login()
  describe('login', () => {
    it('should return JWT token', async () => {
      const payload = {
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      };
      jwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.login(mockUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ access_token: 'mockToken' });
    });
  });
});
