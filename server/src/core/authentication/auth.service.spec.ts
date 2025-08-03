import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Set environment variables (mocked)
    authService.url = 'test-auth0.com';
    authService.clientId = 'client_id';
    authService.clientSecret = 'client_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithAuth0', () => {
    it('should return access token on success', async () => {
      const mockResponse = {
        data: { access_token: 'test_token' },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithAuth0(
        'user@example.com',
        'password123',
      );

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `https://${authService.url}/oauth/token`,
        expect.objectContaining({
          username: 'user@example.com',
          password: 'password123',
        }),
        expect.any(Object),
      );
    });

    it('should throw HttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error_description: 'Invalid credentials' },
          status: 401,
        },
      });

      await expect(
        authService.loginWithAuth0('user@example.com', 'wrongpass'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteAuth0UserByEmail', () => {
    it('should delete user by email', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'mgmt_token' },
      });

      mockedAxios.get.mockResolvedValue({
        data: [{ user_id: 'auth0|123456' }],
      });

      mockedAxios.delete.mockResolvedValue({ status: 204 });

      await expect(
        authService.deleteAuth0UserByEmail('user@example.com'),
      ).resolves.toBeUndefined();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://${authService.url}/api/v2/users-by-email?email=user%40example.com`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer mgmt_token`,
          },
        }),
      );
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `https://${authService.url}/api/v2/users/auth0|123456`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer mgmt_token`,
          },
        }),
      );
    });

    it('should handle errors during deletion gracefully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { access_token: 'mgmt_token' },
      });

      mockedAxios.get.mockRejectedValue({
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      });

      // This test no longer expects console.error to be called
      await expect(
        authService.deleteAuth0UserByEmail('notfound@example.com'),
      ).resolves.toBeUndefined();
    });
  });
});
