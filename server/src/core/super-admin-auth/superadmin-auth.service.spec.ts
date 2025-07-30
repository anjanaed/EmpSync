import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminAuthService } from './superadmin-auth.service';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SuperAdminAuthService', () => {
  let service: SuperAdminAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperAdminAuthService],
    }).compile();

    service = module.get<SuperAdminAuthService>(SuperAdminAuthService);

    // Mock environment variables (manually inject if needed)
    service.url = 'fake-auth0.com';
    service.clientId = 'test-client-id';
    service.clientSecret = 'test-client-secret';
    service.audience = 'fake-api';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('superAdminLoginWithAuth0', () => {
    it('should login successfully and return token', async () => {
      const mockResponse = { data: { access_token: 'superadmin-token' } };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.superAdminLoginWithAuth0('admin@example.com', 'pass123');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `https://${service.url}/oauth/token`,
        expect.objectContaining({
          username: 'admin@example.com',
          password: 'pass123',
          client_id: service.clientId,
          client_secret: service.clientSecret,
          realm: 'SuperAdmin',
        }),
      );
    });

    it('should throw HttpException on login failure', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error_description: 'Invalid credentials' },
          status: 401,
        },
      });

      await expect(
        service.superAdminLoginWithAuth0('admin@example.com', 'wrongpass'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('superAdminDeleteAuth0UserByEmail', () => {
    it('should delete user by email successfully', async () => {
      // Step 1: Token
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'mgmt-token' },
      });

      // Step 2: Get user
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ user_id: 'auth0|999' }],
      });

      // Step 3: Delete user
      mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

      await expect(service.superAdminDeleteAuth0UserByEmail('admin@example.com')).resolves.toBeUndefined();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `https://${service.url}/oauth/token`,
        expect.objectContaining({
          client_id: service.clientId,
          client_secret: service.clientSecret,
          audience: `https://${service.audience}`,
          grant_type: 'client_credentials',
        }),
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://${service.url}/api/v2/users-by-email?email=admin%40example.com`,
        expect.objectContaining({
          headers: { Authorization: `Bearer mgmt-token` },
        }),
      );

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `https://${service.url}/api/v2/users/auth0|999`,
        expect.objectContaining({
          headers: { Authorization: `Bearer mgmt-token` },
        }),
      );
    });

    it('should log error if delete fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'mgmt-token' },
      });

      mockedAxios.get.mockRejectedValue({
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      });

      await service.superAdminDeleteAuth0UserByEmail('notfound@example.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting user from Auth0:',
        { message: 'User not found' },
      );

      consoleSpy.mockRestore();
    });
  });
});
