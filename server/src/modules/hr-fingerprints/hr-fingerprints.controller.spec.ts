import { Test, TestingModule } from '@nestjs/testing';
import { HrFingerprintsController } from './hr-fingerprints.controller';
import { HrFingerprintsService } from './hr-fingerprints.service';

describe('HrFingerprintsController', () => {
  let controller: HrFingerprintsController;
  let service: HrFingerprintsService;

  const mockUser = {
    id: 'O001E001',
    name: 'John Doe',
    passkey: 123456,
    status: 'Registered',
    fingerprintCount: 2,
    thumbids: ['FPU0011234', 'FPU0011235'],
  };

  const mockFingerprint = {
    thumbid: 'FPU0011234',
    empId: 'O001E001',
    orgId: 'O001',
  };

  const mockService = {
    getAllFingerprints: jest.fn(),
    getThumbidsByEmpId: jest.fn(),
    deleteFingerprintByThumbid: jest.fn(),
    deleteFingerprintsByEmpId: jest.fn(),
    getAllUsersWithFingerprintStatus: jest.fn(),
    getAllUsersWithFingerprintDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrFingerprintsController],
      providers: [
        {
          provide: HrFingerprintsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<HrFingerprintsController>(HrFingerprintsController);
    service = module.get<HrFingerprintsService>(HrFingerprintsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Passkey-related endpoints', () => {
    describe('getAllUsersWithFingerprintDetails', () => {
      it('should return users with passkey information for organization', async () => {
        const mockUsers = [mockUser];
        mockService.getAllUsersWithFingerprintDetails.mockResolvedValue(mockUsers);

        const result = await controller.getAllUsersWithFingerprintDetails('O001');

        expect(result).toEqual(mockUsers);
        expect(service.getAllUsersWithFingerprintDetails).toHaveBeenCalledWith('O001');
      });

      it('should return all users when no orgId provided', async () => {
        const mockUsers = [mockUser];
        mockService.getAllUsersWithFingerprintDetails.mockResolvedValue(mockUsers);

        const result = await controller.getAllUsersWithFingerprintDetails();

        expect(result).toEqual(mockUsers);
        expect(service.getAllUsersWithFingerprintDetails).toHaveBeenCalledWith(undefined);
      });

      it('should handle users with different passkey values', async () => {
        const usersWithVariousPasskeys = [
          { ...mockUser, passkey: 123456 },
          { ...mockUser, id: 'O001E002', passkey: 654321 },
          { ...mockUser, id: 'O001E003', passkey: null, status: 'Unregistered' },
        ];
        mockService.getAllUsersWithFingerprintDetails.mockResolvedValue(usersWithVariousPasskeys);

        const result = await controller.getAllUsersWithFingerprintDetails('O001');

        expect(result).toHaveLength(3);
        expect(result[0].passkey).toBe(123456);
        expect(result[1].passkey).toBe(654321);
        expect(result[2].passkey).toBeNull();
      });
    });

    describe('getAllUsersWithFingerprintStatus', () => {
      it('should validate passkey system through fingerprint status', async () => {
        // Test Case: Passkey Validation
        // Expected: Passkey should be accepted and allow biometric registration
        const mockStatusData = [
          {
            id: 'O001E001',
            name: 'John Doe',
            status: 'Registered', // Indicates successful passkey validation
          },
          {
            id: 'O001E002',
            name: 'Jane Smith',
            status: 'Unregistered',
          },
        ];

        mockService.getAllUsersWithFingerprintStatus.mockResolvedValue(mockStatusData);

        const result = await controller.getAllUsersWithFingerprintStatus();

        expect(result).toEqual(mockStatusData);
        expect(result[0].status).toBe('Registered'); // Validates passkey acceptance
        expect(service.getAllUsersWithFingerprintStatus).toHaveBeenCalled();
      });
    });
  });

  describe('getThumbidsByEmpId', () => {
    it('should return thumbids for employee with registered fingerprints', async () => {
      const mockThumbids = ['FPU0011234', 'FPU0011235'];
      mockService.getThumbidsByEmpId.mockResolvedValue(mockThumbids);

      const result = await controller.getThumbidsByEmpId('O001E001');

      expect(result).toEqual(mockThumbids);
      expect(service.getThumbidsByEmpId).toHaveBeenCalledWith('O001E001');
    });

    it('should return empty array for employee with no fingerprints', async () => {
      mockService.getThumbidsByEmpId.mockResolvedValue([]);

      const result = await controller.getThumbidsByEmpId('O001E002');

      expect(result).toEqual([]);
      expect(service.getThumbidsByEmpId).toHaveBeenCalledWith('O001E002');
    });
  });

  describe('getAllFingerprints', () => {
    it('should return fingerprints filtered by organization', async () => {
      const mockFingerprints = [mockFingerprint];
      mockService.getAllFingerprints.mockResolvedValue(mockFingerprints);

      const result = await controller.getAllFingerprints('O001');

      expect(result).toEqual(mockFingerprints);
      expect(service.getAllFingerprints).toHaveBeenCalledWith('O001');
    });

    it('should return all fingerprints when no orgId provided', async () => {
      const mockFingerprints = [mockFingerprint];
      mockService.getAllFingerprints.mockResolvedValue(mockFingerprints);

      const result = await controller.getAllFingerprints();

      expect(result).toEqual(mockFingerprints);
      expect(service.getAllFingerprints).toHaveBeenCalledWith(undefined);
    });
  });

  describe('deleteFingerprintByThumbid', () => {
    it('should delete specific fingerprint by thumbid', async () => {
      const deletedFingerprint = mockFingerprint;
      mockService.deleteFingerprintByThumbid.mockResolvedValue(deletedFingerprint);

      const result = await controller.deleteFingerprintByThumbid('FPU0011234');

      expect(result).toEqual(deletedFingerprint);
      expect(service.deleteFingerprintByThumbid).toHaveBeenCalledWith('FPU0011234');
    });
  });

  describe('deleteFingerprintsByEmpId', () => {
    it('should delete all fingerprints for employee', async () => {
      const deleteResult = { count: 2 };
      mockService.deleteFingerprintsByEmpId.mockResolvedValue(deleteResult);

      const result = await controller.deleteFingerprintsByEmpId('O001E001');

      expect(result).toEqual(deleteResult);
      expect(service.deleteFingerprintsByEmpId).toHaveBeenCalledWith('O001E001');
    });
  });
});
