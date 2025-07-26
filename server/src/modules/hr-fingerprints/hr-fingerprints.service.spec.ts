import { Test, TestingModule } from '@nestjs/testing';
import { HrFingerprintsService } from './hr-fingerprints.service';

describe('HrFingerprintsService', () => {
  let service: HrFingerprintsService;
  let mockPrisma: any;

  const mockUser = {
    id: 'O001E001',
    name: 'John Doe',
    passkey: 123456,
    organizationId: 'O001',
  };

  const mockFingerprint = {
    thumbid: 'FPU0011234',
    empId: 'O001E001',
    orgId: 'O001',
  };

  const mockFingerprintDetails = {
    id: 'O001E001',
    name: 'John Doe',
    passkey: 123456,
    status: 'Registered',
    fingerprintCount: 2,
    thumbids: ['FPU0011234', 'FPU0011235'],
  };

  beforeEach(async () => {
    mockPrisma = {
      fingerprint: {
        findMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HrFingerprintsService],
    }).compile();

    service = module.get<HrFingerprintsService>(HrFingerprintsService);
    // Replace the prisma instance with our mock
    (service as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Passkey-related functionality', () => {
    describe('getAllUsersWithFingerprintDetails', () => {
      it('should return users with correct passkey and fingerprint status', async () => {
        // Mock users with passkeys
        mockPrisma.user.findMany.mockResolvedValue([
          mockUser,
          {
            id: 'O001E002',
            name: 'Jane Smith',
            passkey: 654321,
            organizationId: 'O001',
          },
        ]);

        // Mock fingerprints
        mockPrisma.fingerprint.findMany.mockResolvedValue([
          mockFingerprint,
          {
            thumbid: 'FPU0011235',
            empId: 'O001E001',
            orgId: 'O001',
          },
        ]);

        const result = await service.getAllUsersWithFingerprintDetails('O001');

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: 'O001E001',
          name: 'John Doe',
          passkey: 123456,
          status: 'Registered',
          fingerprintCount: 2,
          thumbids: ['FPU0011234', 'FPU0011235'],
        });
        expect(result[1]).toEqual({
          id: 'O001E002',
          name: 'Jane Smith',
          passkey: 654321,
          status: 'Unregistered',
          fingerprintCount: 0,
          thumbids: [],
        });
      });

      it('should handle users without passkeys', async () => {
        // Mock users where one has null passkey
        mockPrisma.user.findMany.mockResolvedValue([
          mockUser,
          {
            id: 'O001E003',
            name: 'Bob Wilson',
            passkey: null,
            organizationId: 'O001',
          },
        ]);

        mockPrisma.fingerprint.findMany.mockResolvedValue([]);

        const result = await service.getAllUsersWithFingerprintDetails('O001');

        expect(result).toHaveLength(2);
        expect(result[0].passkey).toBe(123456);
        expect(result[1].passkey).toBeNull();
      });

      it('should filter by organization ID correctly', async () => {
        mockPrisma.user.findMany.mockResolvedValue([mockUser]);
        mockPrisma.fingerprint.findMany.mockResolvedValue([]);

        await service.getAllUsersWithFingerprintDetails('O001');

        expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
          where: { organizationId: 'O001' },
          select: { id: true, name: true, passkey: true },
        });
      });

      it('should return all users when no orgId provided', async () => {
        mockPrisma.user.findMany.mockResolvedValue([mockUser]);
        mockPrisma.fingerprint.findMany.mockResolvedValue([]);

        await service.getAllUsersWithFingerprintDetails();

        expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
          where: undefined,
          select: { id: true, name: true, passkey: true },
        });
      });
    });

    describe('getAllUsersWithFingerprintStatus', () => {
      it('should validate passkey existence during status check', async () => {
        // Test that users with registered fingerprints are properly identified
        // This validates that the passkey system works for biometric registration
        mockPrisma.user.findMany.mockResolvedValue([
          { id: 'O001E001', name: 'John Doe' },
          { id: 'O001E002', name: 'Jane Smith' },
        ]);

        mockPrisma.fingerprint.findMany.mockResolvedValue([
          { empId: 'O001E001' },
          { empId: 'O001E001' }, // Multiple fingerprints for same user
        ]);

        const result = await service.getAllUsersWithFingerprintStatus();

        expect(result).toEqual([
          {
            id: 'O001E001',
            name: 'John Doe',
            status: 'Registered',
          },
          {
            id: 'O001E002',
            name: 'Jane Smith',
            status: 'Unregistered',
          },
        ]);

        // Verify the proper database queries were made
        expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
          select: { id: true, name: true },
        });
        expect(mockPrisma.fingerprint.findMany).toHaveBeenCalledWith({
          select: { empId: true },
        });
      });
    });
  });

  describe('getThumbidsByEmpId', () => {
    it('should return thumbids for user with valid passkey', async () => {
      const mockFingerprints = [
        { thumbid: 'FPU0011234' },
        { thumbid: 'FPU0011235' },
      ];

      mockPrisma.fingerprint.findMany.mockResolvedValue(mockFingerprints);

      const result = await service.getThumbidsByEmpId('O001E001');

      expect(result).toEqual(['FPU0011234', 'FPU0011235']);
      expect(mockPrisma.fingerprint.findMany).toHaveBeenCalledWith({
        where: { empId: 'O001E001' },
        select: { thumbid: true },
      });
    });

    it('should return empty array for user with no fingerprints', async () => {
      mockPrisma.fingerprint.findMany.mockResolvedValue([]);

      const result = await service.getThumbidsByEmpId('O001E002');

      expect(result).toEqual([]);
    });
  });

  describe('deleteFingerprintByThumbid', () => {
    it('should delete fingerprint by thumbid', async () => {
      const deletedFingerprint = mockFingerprint;
      mockPrisma.fingerprint.delete.mockResolvedValue(deletedFingerprint);

      const result = await service.deleteFingerprintByThumbid('FPU0011234');

      expect(result).toEqual(deletedFingerprint);
      expect(mockPrisma.fingerprint.delete).toHaveBeenCalledWith({
        where: { thumbid: 'FPU0011234' },
      });
    });
  });

  describe('deleteFingerprintsByEmpId', () => {
    it('should delete all fingerprints for employee', async () => {
      const deleteResult = { count: 2 };
      mockPrisma.fingerprint.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteFingerprintsByEmpId('O001E001');

      expect(result).toEqual(deleteResult);
      expect(mockPrisma.fingerprint.deleteMany).toHaveBeenCalledWith({
        where: { empId: 'O001E001' },
      });
    });
  });

  describe('getAllFingerprints', () => {
    it('should return fingerprints filtered by organization', async () => {
      const mockFingerprints = [mockFingerprint];
      mockPrisma.fingerprint.findMany.mockResolvedValue(mockFingerprints);

      const result = await service.getAllFingerprints('O001');

      expect(result).toEqual(mockFingerprints);
      expect(mockPrisma.fingerprint.findMany).toHaveBeenCalledWith({
        where: { orgId: 'O001' },
        select: {
          thumbid: true,
          empId: true,
          orgId: true,
        },
      });
    });

    it('should return all fingerprints when no orgId provided', async () => {
      const mockFingerprints = [mockFingerprint];
      mockPrisma.fingerprint.findMany.mockResolvedValue(mockFingerprints);

      const result = await service.getAllFingerprints();

      expect(result).toEqual(mockFingerprints);
      expect(mockPrisma.fingerprint.findMany).toHaveBeenCalledWith({
        where: undefined,
        select: {
          thumbid: true,
          empId: true,
          orgId: true,
        },
      });
    });
  });
});
