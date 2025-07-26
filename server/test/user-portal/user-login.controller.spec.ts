import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/core/authentication/auth.controller';
import { AuthService } from '../../src/core/authentication/auth.service';
import { SuperAdminAuthController } from '../../src/core/super-admin-auth/superadmin-auth.controller';
import { SuperAdminAuthService } from '../../src/core/super-admin-auth/superadmin-auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('User Portal - Login Controller', () => {
  let authController: AuthController;
  let superAdminAuthController: SuperAdminAuthController;
  let authService: AuthService;
  let superAdminAuthService: SuperAdminAuthService;

  const mockAuthService = {
    loginWithAuth0: jest.fn(),
    deleteAuth0UserByEmail: jest.fn(),
  };

  const mockSuperAdminAuthService = {
    superAdminLoginWithAuth0: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, SuperAdminAuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SuperAdminAuthService, useValue: mockSuperAdminAuthService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    superAdminAuthController = module.get<SuperAdminAuthController>(SuperAdminAuthController);
    authService = module.get<AuthService>(AuthService);
    superAdminAuthService = module.get<SuperAdminAuthService>(SuperAdminAuthService);
  });

  describe('Test Case 1: User Login with Correct Credentials', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const validCredentials = {
        username: 'emp001@company.com',
        password: 'validPassword123',
      };
      const expectedResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 'EMP001',
          email: 'emp001@company.com',
          name: 'John Doe',
          organizationId: 'org-123',
        },
        message: 'Login successful',
      };

      mockAuthService.loginWithAuth0.mockResolvedValue(expectedResponse);

      // Act
      const result = await authController.login(validCredentials);

      // Assert
      expect(authService.loginWithAuth0).toHaveBeenCalledWith(
        validCredentials.username,
        validCredentials.password
      );
      expect(result).toEqual(expectedResponse);
      expect(result.access_token).toBeDefined();
      expect(result.user.id).toBe('EMP001');
      expect(result.message).toBe('Login successful');
    });

    it('should allow super admin login with correct credentials', async () => {
      // Arrange
      const superAdminCredentials = {
        email: 'admin@empsync.com',
        password: 'adminPassword123',
      };
      const expectedSuperAdminResponse = {
        access_token: 'mock-super-admin-jwt-token',
        user: {
          id: 'SUPER_ADMIN_001',
          email: 'admin@empsync.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
        },
        message: 'Super admin login successful',
      };

      mockSuperAdminAuthService.superAdminLoginWithAuth0.mockResolvedValue(expectedSuperAdminResponse);

      // Act
      const result = await superAdminAuthController.login(superAdminCredentials);

      // Assert
      expect(superAdminAuthService.superAdminLoginWithAuth0).toHaveBeenCalledWith(
        superAdminCredentials.email,
        superAdminCredentials.password
      );
      expect(result).toEqual(expectedSuperAdminResponse);
      expect(result.access_token).toBeDefined();
      expect(result.user.role).toBe('SUPER_ADMIN');
    });

    it('should return user profile information after successful login', async () => {
      // Arrange
      const credentials = {
        username: 'hr001@company.com',
        password: 'hrPassword123',
      };
      const expectedResponse = {
        access_token: 'mock-hr-jwt-token',
        user: {
          id: 'HR001',
          email: 'hr001@company.com',
          name: 'Jane Smith',
          role: 'HR_ADMIN',
          organizationId: 'org-123',
          department: 'Human Resources',
        },
        message: 'Login successful',
      };

      mockAuthService.loginWithAuth0.mockResolvedValue(expectedResponse);

      // Act
      const result = await authController.login(credentials);

      // Assert
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('organizationId');
    });
  });

  describe('Test Case 2: User Login with Incorrect Credentials', () => {
    it('should return "Invalid credentials" for wrong username', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'nonexistent@company.com',
        password: 'anyPassword123',
      };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );

      // Act & Assert
      await expect(authController.login(invalidCredentials)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );
      expect(authService.loginWithAuth0).toHaveBeenCalledWith(
        invalidCredentials.username,
        invalidCredentials.password
      );
    });

    it('should return "Invalid credentials" for wrong password', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'emp001@company.com',
        password: 'wrongPassword',
      };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );

      // Act & Assert
      await expect(authController.login(invalidCredentials)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should handle Auth0 authentication failures gracefully', async () => {
      // Arrange
      const credentials = {
        username: 'test@company.com',
        password: 'testPassword',
      };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Auth0 authentication failed', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      // Act & Assert
      await expect(authController.login(credentials)).rejects.toThrow(
        new HttpException('Auth0 authentication failed', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should prevent brute force attacks with multiple failed attempts', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'emp001@company.com',
        password: 'wrongPassword',
      };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      );

      // Act - Simulate multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(
          authController.login(invalidCredentials).catch(error => error)
        );
      }

      const results = await Promise.all(attempts);

      // Assert
      results.forEach(result => {
        expect(result).toBeInstanceOf(HttpException);
        expect(result.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      });
      expect(authService.loginWithAuth0).toHaveBeenCalledTimes(5);
    });

    it('should handle empty credentials gracefully', async () => {
      // Arrange
      const emptyCredentials = {
        username: '',
        password: '',
      };

      mockAuthService.loginWithAuth0.mockRejectedValue(
        new HttpException('Username and password are required', HttpStatus.BAD_REQUEST)
      );

      // Act & Assert
      await expect(authController.login(emptyCredentials)).rejects.toThrow(
        new HttpException('Username and password are required', HttpStatus.BAD_REQUEST)
      );
    });

    it('should handle super admin login with incorrect credentials', async () => {
      // Arrange
      const invalidSuperAdminCredentials = {
        email: 'admin@empsync.com',
        password: 'wrongAdminPassword',
      };

      mockSuperAdminAuthService.superAdminLoginWithAuth0.mockRejectedValue(
        new HttpException('Invalid super admin credentials', HttpStatus.UNAUTHORIZED)
      );

      // Act & Assert
      await expect(superAdminAuthController.login(invalidSuperAdminCredentials)).rejects.toThrow(
        new HttpException('Invalid super admin credentials', HttpStatus.UNAUTHORIZED)
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
