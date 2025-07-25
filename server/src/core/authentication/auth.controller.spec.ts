import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    loginWithAuth0: jest.fn(),
    deleteAuth0UserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials = { username: 'user@example.com', password: 'password123' };
      const tokenResponse = { access_token: 'fake-jwt-token' };

      mockAuthService.loginWithAuth0.mockResolvedValue(tokenResponse);

      await expect(authController.login(credentials)).resolves.toEqual(tokenResponse);
      expect(mockAuthService.loginWithAuth0).toHaveBeenCalledWith('user@example.com', 'password123');
    });

    it('should throw an error if login fails', async () => {
      const credentials = { username: 'user@example.com', password: 'wrongpassword' };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      );

      await expect(authController.login(credentials)).rejects.toThrow(HttpException);
      expect(mockAuthService.loginWithAuth0).toHaveBeenCalledWith('user@example.com', 'wrongpassword');
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const body = { email: 'user@example.com' };
      const response = { message: 'User deleted' };

      mockAuthService.deleteAuth0UserByEmail.mockResolvedValue(response);

      await expect(authController.remove(body)).resolves.toEqual(response);
      expect(mockAuthService.deleteAuth0UserByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('should throw an error if removal fails', async () => {
      const body = { email: 'user@example.com' };

      mockAuthService.deleteAuth0UserByEmail.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(authController.remove(body)).rejects.toThrow(HttpException);
      expect(mockAuthService.deleteAuth0UserByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
