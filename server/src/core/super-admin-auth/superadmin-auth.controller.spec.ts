import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminAuthController } from './superadmin-auth.controller';
import { SuperAdminAuthService } from './superadmin-auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('SuperAdminAuthController', () => {
  let controller: SuperAdminAuthController;
  let service: SuperAdminAuthService;

  const mockSuperAdminAuthService = {
    superAdminLoginWithAuth0: jest.fn(),
    superAdminDeleteAuth0UserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminAuthController],
      providers: [
        {
          provide: SuperAdminAuthService,
          useValue: mockSuperAdminAuthService,
        },
      ],
    }).compile();

    controller = module.get<SuperAdminAuthController>(SuperAdminAuthController);
    service = module.get<SuperAdminAuthService>(SuperAdminAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'admin@example.com', password: 'securepass' };
      const mockResponse = { access_token: 'superadmin-token' };

      mockSuperAdminAuthService.superAdminLoginWithAuth0.mockResolvedValue(mockResponse);

      await expect(controller.login(credentials)).resolves.toEqual(mockResponse);
      expect(mockSuperAdminAuthService.superAdminLoginWithAuth0).toHaveBeenCalledWith(
        'admin@example.com',
        'securepass',
      );
    });

    it('should throw an error if login fails', async () => {
      mockSuperAdminAuthService.superAdminLoginWithAuth0.mockRejectedValue(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      );

      await expect(
        controller.login({ email: 'admin@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(HttpException);
      expect(mockSuperAdminAuthService.superAdminLoginWithAuth0).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const body = { email: 'admin@example.com' };
      const mockResponse = { message: 'User deleted' };

      mockSuperAdminAuthService.superAdminDeleteAuth0UserByEmail.mockResolvedValue(mockResponse);

      await expect(controller.remove(body)).resolves.toEqual(mockResponse);
      expect(mockSuperAdminAuthService.superAdminDeleteAuth0UserByEmail).toHaveBeenCalledWith('admin@example.com');
    });

    it('should throw an error if delete fails', async () => {
      mockSuperAdminAuthService.superAdminDeleteAuth0UserByEmail.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.remove({ email: 'notfound@example.com' }),
      ).rejects.toThrow(HttpException);
      expect(mockSuperAdminAuthService.superAdminDeleteAuth0UserByEmail).toHaveBeenCalled();
    });
  });
});
