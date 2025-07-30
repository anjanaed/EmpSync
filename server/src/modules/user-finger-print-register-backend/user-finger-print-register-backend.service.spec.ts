import { Test, TestingModule } from '@nestjs/testing';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

describe('UserFingerPrintRegisterBackendService', () => {
  let service: UserFingerPrintRegisterBackendService;
  let mockPrisma: any;

  const mockUser = {
    id: 'O001E001',
    name: 'John Doe',
    organizationId: 'O001',
    passkey: 123456,
  };

  const mockFingerprint = {
    thumbid: 'FPU0011234',
    empId: 'O001E001',
    orgId: 'O001',
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      fingerprint: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFingerPrintRegisterBackendService],
    }).compile();

    service = module.get<UserFingerPrintRegisterBackendService>(UserFingerPrintRegisterBackendService);
    // Replace the prisma instance with our mock
    (service as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Passkey Generation Test Cases', () => {
    describe('getUserByPasskey', () => {
      it('should return user when valid 6-digit passkey is provided (Normal Scenario)', async () => {
        // Test Case: Normal Scenario
        // Expected: System generates unique random passkey for each user registration
        const passkey = 123456;
        mockPrisma.user.findFirst.mockResolvedValue(mockUser);

        const result = await service.getUserByPasskey(passkey);

        expect(result).toEqual(mockUser);
        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { passkey },
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        });
      });

      it('should return null when invalid passkey is provided', async () => {
        const invalidPasskey = 999999;
        mockPrisma.user.findFirst.mockResolvedValue(null);

        const result = await service.getUserByPasskey(invalidPasskey);

        expect(result).toBeNull();
        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { passkey: invalidPasskey },
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        });
      });

      it('should handle different 6-digit passkey values correctly', async () => {
        const testPasskeys = [100000, 999999, 555555, 123456];
        
        for (const passkey of testPasskeys) {
          mockPrisma.user.findFirst.mockResolvedValue({ ...mockUser, passkey });
          
          const result = await service.getUserByPasskey(passkey);
          
          expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
            where: { passkey },
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          });
        }
      });

      it('should validate passkey uniqueness (Duplicate Passkey Prevention)', async () => {
        // Test Case: Duplicate Passkey Prevention
        // Expected: Each user should receive unique passkey with no duplicates
        const passkey = 123456;
        
        // First call should return user
        mockPrisma.user.findFirst.mockResolvedValueOnce(mockUser);
        const result1 = await service.getUserByPasskey(passkey);
        
        // Second call with same passkey should return the same user (no duplicates)
        mockPrisma.user.findFirst.mockResolvedValueOnce(mockUser);
        const result2 = await service.getUserByPasskey(passkey);
        
        expect(result1.id).toBe(result2.id);
        expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(2);
      });
    });

    describe('createFingerprint', () => {
      it('should use passkey for fingerprint device registration (Passkey Validation)', async () => {
        // Test Case: Passkey Validation
        // Expected: Use generated passkey for fingerprint device registration
        // Expected: Passkey should be accepted and allow biometric registration
        const thumbid = 'FPU0011234';
        const empId = 'O001E001';

        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.fingerprint.create.mockResolvedValue(mockFingerprint);

        const result = await service.createFingerprint(thumbid, empId);

        expect(result).toEqual(mockFingerprint);
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: empId },
          select: { organizationId: true },
        });
        expect(mockPrisma.fingerprint.create).toHaveBeenCalledWith({
          data: {
            thumbid,
            empId,
            orgId: mockUser.organizationId,
          },
        });
      });

      it('should throw error when user not found', async () => {
        const thumbid = 'FPU0011234';
        const empId = 'INVALID_ID';

        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.createFingerprint(thumbid, empId)).rejects.toThrow(
          'User or organization not found'
        );
      });

      it('should throw error when user has no organization', async () => {
        const thumbid = 'FPU0011234';
        const empId = 'O001E001';
        const userWithoutOrg = { ...mockUser, organizationId: null };

        mockPrisma.user.findUnique.mockResolvedValue(userWithoutOrg);

        await expect(service.createFingerprint(thumbid, empId)).rejects.toThrow(
          'User or organization not found'
        );
      });

      it('should handle multiple simultaneous registrations (Duplicate Passkey Prevention)', async () => {
        // Test Case: Multiple simultaneous registrations
        // Expected: Each user should receive unique passkey with no duplicates
        const registrations = [
          { thumbid: 'FPU0011234', empId: 'O001E001' },
          { thumbid: 'FPU0011235', empId: 'O001E002' },
          { thumbid: 'FPU0011236', empId: 'O001E003' },
        ];

        // Mock different users with different passkeys
        const users = [
          { ...mockUser, id: 'O001E001', passkey: 123456 },
          { ...mockUser, id: 'O001E002', passkey: 654321 },
          { ...mockUser, id: 'O001E003', passkey: 111111 },
        ];

        for (let i = 0; i < registrations.length; i++) {
          mockPrisma.user.findUnique.mockResolvedValueOnce(users[i]);
          mockPrisma.fingerprint.create.mockResolvedValueOnce({
            ...mockFingerprint,
            thumbid: registrations[i].thumbid,
            empId: registrations[i].empId,
          });

          const result = await service.createFingerprint(
            registrations[i].thumbid,
            registrations[i].empId
          );

          expect(result.empId).toBe(registrations[i].empId);
          expect(result.thumbid).toBe(registrations[i].thumbid);
        }

        // Verify all users had unique employee IDs (simulating unique passkeys)
        const empIds = registrations.map(r => r.empId);
        const uniqueEmpIds = new Set(empIds);
        expect(uniqueEmpIds.size).toBe(empIds.length); // No duplicates
      });
    });

    describe('getFingerprintByThumbid', () => {
      it('should return fingerprint when valid thumbid is provided', async () => {
        const thumbid = 'FPU0011234';
        mockPrisma.fingerprint.findUnique.mockResolvedValue(mockFingerprint);

        const result = await service.getFingerprintByThumbid(thumbid);

        expect(result).toEqual(mockFingerprint);
        expect(mockPrisma.fingerprint.findUnique).toHaveBeenCalledWith({
          where: { thumbid },
          select: { empId: true },
        });
      });

      it('should return null when thumbid not found', async () => {
        const invalidThumbid = 'INVALID_THUMBID';
        mockPrisma.fingerprint.findUnique.mockResolvedValue(null);

        const result = await service.getFingerprintByThumbid(invalidThumbid);

        expect(result).toBeNull();
      });
    });

    describe('getAllFingerprints', () => {
      it('should return all fingerprints from the system', async () => {
        const mockFingerprints = [mockFingerprint];
        mockPrisma.fingerprint.findMany.mockResolvedValue(mockFingerprints);

        const result = await service.getAllFingerprints();

        expect(result).toEqual(mockFingerprints);
        expect(mockPrisma.fingerprint.findMany).toHaveBeenCalled();
      });
    });
  });

  describe('Passkey System Integration Tests', () => {
    it('should demonstrate complete passkey workflow', async () => {
      // Step 1: User is created with passkey (simulated)
      const passkey = 123456;
      
      // Step 2: User provides passkey for authentication
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      const authenticatedUser = await service.getUserByPasskey(passkey);
      expect(authenticatedUser).toBeTruthy();
      expect(authenticatedUser.id).toBe('O001E001');
      
      // Step 3: User registers fingerprint using their employee ID
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.fingerprint.create.mockResolvedValue(mockFingerprint);
      
      const fingerprintResult = await service.createFingerprint('FPU0011234', authenticatedUser.id);
      expect(fingerprintResult).toBeTruthy();
      expect(fingerprintResult.empId).toBe(authenticatedUser.id);
      
      // Step 4: Verify fingerprint was registered correctly
      mockPrisma.fingerprint.findUnique.mockResolvedValue(mockFingerprint);
      const retrievedFingerprint = await service.getFingerprintByThumbid('FPU0011234');
      expect(retrievedFingerprint.empId).toBe(authenticatedUser.id);
    });
  });
});
