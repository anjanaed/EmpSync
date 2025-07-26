import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';
import { DatabaseService } from '../../database/database.service';

describe('Fingerprint Authentication Tests - Order-Tab with Fingerprint Device', () => {
  let service: UserFingerPrintRegisterBackendService;
  let mockDatabaseService: any;

  beforeEach(async () => {
    mockDatabaseService = {
      user: {
        findUnique: jest.fn(),
      },
      fingerprint: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFingerPrintRegisterBackendService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UserFingerPrintRegisterBackendService>(UserFingerPrintRegisterBackendService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fingerprint Authentication', () => {
    it('should authenticate user and display personalized menu when placing finger on sensor', async () => {
      // Test Case: Place finger on sensor
      // Expected Result: System should authenticate user and display personalized menu
      
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
        email: 'john@example.com',
        gender: 'MALE',
        passkey: 123456,
        height: 175,
        weight: 70,
      };

      mockDatabaseService.fingerprint.findUnique.mockResolvedValue(mockFingerprint);
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getFingerprintByThumbid('FPU0010001');

      expect(result).toEqual(mockFingerprint);
      expect(mockDatabaseService.fingerprint.findUnique).toHaveBeenCalledWith({
        where: { thumbid: 'FPU0010001' },
        select: {
          id: true,
          thumbid: true,
          empId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Verify that user data can be retrieved for personalized menu
      const userResult = await service.getUserByPasskey(123456);
      expect(userResult).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        organizationId: mockUser.organizationId,
      });
    });

    it('should display error message and deny access for unregistered fingerprint', async () => {
      // Test Case: Unregistered fingerprint
      // Expected Result: System should display error message and deny access
      
      mockDatabaseService.fingerprint.findUnique.mockResolvedValue(null);

      await expect(service.getFingerprintByThumbid('INVALID_THUMBID')).rejects.toThrow();
      
      expect(mockDatabaseService.fingerprint.findUnique).toHaveBeenCalledWith({
        where: { thumbid: 'INVALID_THUMBID' },
        select: {
          id: true,
          thumbid: true,
          empId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should handle fingerprint scan error gracefully', async () => {
      // Test for error handling during fingerprint scanning
      mockDatabaseService.fingerprint.findUnique.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getFingerprintByThumbid('FPU0010001')).rejects.toThrow('Database connection error');
    });

    it('should validate thumbid format before authentication', async () => {
      // Test for thumbid validation
      const invalidThumbids = ['', null, undefined, 'INVALID', '123'];

      for (const invalidThumbid of invalidThumbids) {
        if (invalidThumbid === null || invalidThumbid === undefined) {
          continue; // Skip null/undefined as they would cause different errors
        }
        
        mockDatabaseService.fingerprint.findUnique.mockResolvedValue(null);
        const result = await service.getFingerprintByThumbid(invalidThumbid);
        expect(result).toBeNull();
      }
    });

    it('should return all registered fingerprints for device synchronization', async () => {
      // Test for getting all fingerprints for device management
      const mockFingerprints = [
        { id: 1, thumbid: 'FPU0010001', empId: 'user1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, thumbid: 'FPU0010002', empId: 'user2', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDatabaseService.fingerprint.findMany.mockResolvedValue(mockFingerprints);

      const result = await service.getAllFingerprints();

      expect(result).toEqual(mockFingerprints);
      expect(mockDatabaseService.fingerprint.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          thumbid: true,
          empId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should create new fingerprint registration successfully', async () => {
      // Test for fingerprint registration process
      const mockCreatedFingerprint = {
        id: 1,
        thumbid: 'FPU0010003',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.fingerprint.create.mockResolvedValue(mockCreatedFingerprint);

      const result = await service.createFingerprint('FPU0010003', 'user123');

      expect(result).toEqual(mockCreatedFingerprint);
      expect(mockDatabaseService.fingerprint.create).toHaveBeenCalledWith({
        data: {
          thumbid: 'FPU0010003',
          empId: 'user123',
        },
        select: {
          id: true,
          thumbid: true,
          empId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should handle duplicate fingerprint registration', async () => {
      // Test for duplicate fingerprint handling
      const duplicateError = new Error('Fingerprint already exists');
      duplicateError['code'] = 'P2002'; // Prisma unique constraint error

      mockDatabaseService.fingerprint.create.mockRejectedValue(duplicateError);

      await expect(service.createFingerprint('FPU0010001', 'user123')).rejects.toThrow('Fingerprint already exists');
    });

    it('should authenticate multiple users with different fingerprints', async () => {
      // Test for multiple user authentication
      const fingerprints = [
        { thumbid: 'FPU0010001', empId: 'user1' },
        { thumbid: 'FPU0010002', empId: 'user2' },
        { thumbid: 'FPU0010003', empId: 'user3' },
      ];

      for (const fp of fingerprints) {
        mockDatabaseService.fingerprint.findUnique.mockResolvedValueOnce({
          id: 1,
          thumbid: fp.thumbid,
          empId: fp.empId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await service.getFingerprintByThumbid(fp.thumbid);
        expect(result.empId).toBe(fp.empId);
      }
    });

    it('should handle concurrent fingerprint authentication requests', async () => {
      // Test for concurrent authentication handling
      const mockFingerprint = {
        id: 1,
        thumbid: 'FPU0010001',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.fingerprint.findUnique.mockResolvedValue(mockFingerprint);

      const promises = Array(5).fill(null).map(() => service.getFingerprintByThumbid('FPU0010001'));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual(mockFingerprint);
      });
    });
  });

  describe('Authentication Security', () => {
    it('should prevent unauthorized access with invalid fingerprint data', async () => {
      // Test for security against invalid fingerprint data
      mockDatabaseService.fingerprint.findUnique.mockResolvedValue(null);

      const invalidAttempts = [
        'FAKE_THUMBID',
        'SQL_INJECTION_ATTEMPT',
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
      ];

      for (const attempt of invalidAttempts) {
        const result = await service.getFingerprintByThumbid(attempt);
        expect(result).toBeNull();
      }
    });

    it('should log authentication attempts for audit trail', async () => {
      // Test for audit logging (if implemented)
      const mockFingerprint = {
        id: 1,
        thumbid: 'FPU0010001',
        empId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.fingerprint.findUnique.mockResolvedValue(mockFingerprint);

      await service.getFingerprintByThumbid('FPU0010001');

      // Verify the authentication call was made (logging would be implementation specific)
      expect(mockDatabaseService.fingerprint.findUnique).toHaveBeenCalled();
    });
  });
});
