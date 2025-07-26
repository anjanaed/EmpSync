import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserFingerPrintRegisterBackendController } from './user-finger-print-register-backend.controller';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

describe('Fingerprint Authentication Controller - Order-Tab with Fingerprint Device', () => {
  let controller: UserFingerPrintRegisterBackendController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getUserByPasskey: jest.fn(),
      getFingerprintByThumbid: jest.fn(),
      createFingerprint: jest.fn(),
      getAllFingerprints: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFingerPrintRegisterBackendController],
      providers: [
        {
          provide: UserFingerPrintRegisterBackendService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserFingerPrintRegisterBackendController>(UserFingerPrintRegisterBackendController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fingerprint Authentication API Endpoints', () => {
    it('should authenticate user through fingerprint and return user data for menu display', async () => {
      // Test Case: Place finger on sensor (API endpoint)
      // Expected Result: System should authenticate user and display personalized menu
      
      const mockFingerprint = {
        id: 1,
        thumbid: 'FPU0010001',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.getFingerprintByThumbid.mockResolvedValue(mockFingerprint);

      const result = await controller.getFingerprintByThumbid('FPU0010001');

      expect(result).toEqual(mockFingerprint);
      expect(mockService.getFingerprintByThumbid).toHaveBeenCalledWith('FPU0010001');
    });

    it('should reject unregistered fingerprint and throw appropriate error', async () => {
      // Test Case: Unregistered fingerprint (API endpoint)
      // Expected Result: System should display error message and deny access
      
      mockService.getFingerprintByThumbid.mockResolvedValue(null);

      await expect(controller.getFingerprintByThumbid('INVALID_THUMBID'))
        .rejects.toThrow(BadRequestException);

      expect(mockService.getFingerprintByThumbid).toHaveBeenCalledWith('INVALID_THUMBID');
    });

    it('should validate thumbid parameter and reject empty values', async () => {
      // Test for API parameter validation
      await expect(controller.getFingerprintByThumbid(''))
        .rejects.toThrow(BadRequestException);

      await expect(controller.getFingerprintByThumbid(null as any))
        .rejects.toThrow(BadRequestException);

      await expect(controller.getFingerprintByThumbid(undefined as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should return user data by passkey for PIN authentication', async () => {
      // Test for PIN-based authentication as alternative to fingerprint
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        organizationId: 'org123',
      };

      mockService.getUserByPasskey.mockResolvedValue(mockUser);

      const result = await controller.getUserByPasskey('123456');

      expect(result).toEqual(mockUser);
      expect(mockService.getUserByPasskey).toHaveBeenCalledWith(123456);
    });

    it('should validate passkey parameter format', async () => {
      // Test for passkey validation
      const invalidPasskeys = ['', 'abc', 'null', 'undefined'];

      for (const invalidPasskey of invalidPasskeys) {
        await expect(controller.getUserByPasskey(invalidPasskey))
          .rejects.toThrow(BadRequestException);
      }
    });

    it('should handle user not found for passkey authentication', async () => {
      // Test for invalid passkey handling
      mockService.getUserByPasskey.mockResolvedValue(null);

      await expect(controller.getUserByPasskey('999999'))
        .rejects.toThrow(BadRequestException);

      expect(mockService.getUserByPasskey).toHaveBeenCalledWith(999999);
    });

    it('should register new fingerprint successfully', async () => {
      // Test for fingerprint registration endpoint
      const mockCreatedFingerprint = {
        id: 1,
        thumbid: 'FPU0010003',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFingerprint.mockResolvedValue(mockCreatedFingerprint);

      const result = await controller.createFingerprint({
        thumbid: 'FPU0010003',
        empId: 'user123',
      });

      expect(result).toEqual(mockCreatedFingerprint);
      expect(mockService.createFingerprint).toHaveBeenCalledWith('FPU0010003', 'user123');
    });

    it('should validate fingerprint registration request body', async () => {
      // Test for registration validation
      const invalidBodies = [
        { thumbid: '', empId: 'user123' },
        { thumbid: 'FPU0010003', empId: '' },
        { thumbid: 'FPU0010003' },
        { empId: 'user123' },
        {},
      ];

      for (const invalidBody of invalidBodies) {
        await expect(controller.createFingerprint(invalidBody as any))
          .rejects.toThrow(BadRequestException);
      }
    });

    it('should use register endpoint as alternative to fingerprint endpoint', async () => {
      // Test for alternative registration endpoint
      const mockCreatedFingerprint = {
        id: 1,
        thumbid: 'FPU0010004',
        empId: 'user456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFingerprint.mockResolvedValue(mockCreatedFingerprint);

      const result = await controller.registerFingerprint({
        thumbid: 'FPU0010004',
        empId: 'user456',
      });

      expect(result).toEqual(mockCreatedFingerprint);
      expect(mockService.createFingerprint).toHaveBeenCalledWith('FPU0010004', 'user456');
    });

    it('should return all fingerprints for system management', async () => {
      // Test for getting all fingerprints
      const mockFingerprints = [
        { id: 1, thumbid: 'FPU0010001', empId: 'user1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, thumbid: 'FPU0010002', empId: 'user2', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockService.getAllFingerprints.mockResolvedValue(mockFingerprints);

      const result = await controller.getAllFingerprints();

      expect(result).toEqual(mockFingerprints);
      expect(mockService.getAllFingerprints).toHaveBeenCalled();
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should support complete authentication flow from fingerprint to user data', async () => {
      // Test for complete authentication workflow
      const mockFingerprint = {
        id: 1,
        thumbid: 'FPU0010001',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        organizationId: 'org123',
      };

      mockService.getFingerprintByThumbid.mockResolvedValue(mockFingerprint);
      mockService.getUserByPasskey.mockResolvedValue(mockUser);

      // Step 1: Authenticate with fingerprint
      const fingerprintResult = await controller.getFingerprintByThumbid('FPU0010001');
      expect(fingerprintResult.empId).toBe('user123');

      // Step 2: Get user data for personalized menu (if passkey is available)
      const userResult = await controller.getUserByPasskey('123456');
      expect(userResult.name).toBe('John Doe');
    });

    it('should handle authentication errors gracefully', async () => {
      // Test for error handling in authentication flow
      mockService.getFingerprintByThumbid.mockRejectedValue(new Error('Database error'));

      await expect(controller.getFingerprintByThumbid('FPU0010001'))
        .rejects.toThrow('Database error');
    });

    it('should support multiple authentication methods', async () => {
      // Test for supporting both fingerprint and PIN authentication
      const mockFingerprint = {
        id: 1,
        thumbid: 'FPU0010001',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        organizationId: 'org123',
      };

      // Fingerprint authentication
      mockService.getFingerprintByThumbid.mockResolvedValue(mockFingerprint);
      const fingerprintAuth = await controller.getFingerprintByThumbid('FPU0010001');
      expect(fingerprintAuth).toBeDefined();

      // PIN authentication
      mockService.getUserByPasskey.mockResolvedValue(mockUser);
      const pinAuth = await controller.getUserByPasskey('123456');
      expect(pinAuth).toBeDefined();
    });
  });
});
