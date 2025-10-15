import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 1,
    username: 'john',
    password: 'hashedpassword',
    role: 'user' as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST: login()
  describe('login', () => {
    it('should return an access token', async () => {
      const req = { user: mockUser };
      const expectedToken = { access_token: 'mockToken' };

      authService.login.mockResolvedValue(expectedToken);

      const result = await controller.login(req);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedToken);
    });
  });

  // TEST: getProfile()
  describe('getProfile', () => {
    it('should return the user profile', () => {
      const req = { user: mockUser };

      const result = controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });
});
