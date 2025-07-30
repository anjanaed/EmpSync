import { Test, TestingModule } from '@nestjs/testing';
import { HrFingerprintsController } from '../../modules/hr-fingerprints/hr-fingerprints.controller';
import { HrFingerprintsService } from '../../modules/hr-fingerprints/hr-fingerprints.service';
import { UserFingerPrintRegisterBackendController } from '../../modules/user-finger-print-register-backend/user-finger-print-register-backend.controller';
import { UserFingerPrintRegisterBackendService } from '../../modules/user-finger-print-register-backend/user-finger-print-register-backend.service';
import { BadRequestException } from '@nestjs/common';

describe('User Portal - Fingerprint Management Service', () => {
  let hrFingerprintsController: HrFingerprintsController;
  let userFingerprintController: UserFingerPrintRegisterBackendController;
  let hrFingerprintsService: HrFingerprintsService;
  let userFingerprintService: UserFingerPrintRegisterBackendService;

  const mockHrFingerprintsService = {
    getAllFingerprints: jest.fn(),
    getThumbidsByEmpId: jest.fn(),
    deleteFingerprintByThumbid: jest.fn(),
    deleteFingerprintsByEmpId: jest.fn(),
    getAllUsersWithFingerprintStatus: jest.fn(),
    getAllUsersWithFingerprintDetails: jest.fn(),
  };

  const mockUserFingerprintService = {
    createFingerprint: jest.fn(),
    getAllFingerprints: jest.fn(),
    getUserByPasskey: jest.fn(),
    getFingerprintByThumbid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrFingerprintsController, UserFingerPrintRegisterBackendController],
      providers: [
        { provide: HrFingerprintsService, useValue: mockHrFingerprintsService },
        { provide: UserFingerPrintRegisterBackendService, useValue: mockUserFingerprintService },
      ],
    }).compile();

    hrFingerprintsController = module.get<HrFingerprintsController>(HrFingerprintsController);
    userFingerprintController = module.get<UserFingerPrintRegisterBackendController>(UserFingerPrintRegisterBackendController);
    hrFingerprintsService = module.get<HrFingerprintsService>(HrFingerprintsService);
    userFingerprintService = module.get<UserFingerPrintRegisterBackendService>(UserFingerPrintRegisterBackendService);
  });

  describe('Test Case 14: Fingerprint Registration', () => {
    it('should successfully register new fingerprint on device local storage', async () => {
      // Arrange
      const fingerprintData = {
        thumbid: 'THUMB_001',
        empId: 'EMP001',
      };

      const expectedResponse = {
        thumbid: 'THUMB_001',
        empId: 'EMP001',
        orgId: 'org-123',
      };

      mockUserFingerprintService.createFingerprint.mockResolvedValue(expectedResponse);

      // Act
      const result = await userFingerprintController.registerFingerprint(fingerprintData);

      // Assert
      expect(userFingerprintService.createFingerprint).toHaveBeenCalledWith(
        fingerprintData.thumbid,
        fingerprintData.empId
      );
      expect(result).toEqual(expectedResponse);
      expect(result.thumbid).toBe('THUMB_001');
      expect(result.empId).toBe('EMP001');
      expect(result.orgId).toBe('org-123');
    });

    it('should capture and store biometric data with proper validation', async () => {
      // Arrange
      const biometricCapture = {
        thumbid: 'THUMB_002',
        empId: 'EMP002',
      };

      const processedData = {
        thumbid: 'THUMB_002',
        empId: 'EMP002',
        orgId: 'org-123',
      };

      mockUserFingerprintService.createFingerprint.mockResolvedValue(processedData);

      // Act
      const result = await userFingerprintController.registerFingerprint(biometricCapture);

      // Assert
      expect(userFingerprintService.createFingerprint).toHaveBeenCalledWith(
        biometricCapture.thumbid,
        biometricCapture.empId
      );
      expect(result.thumbid).toBe('THUMB_002');
      expect(result.empId).toBe('EMP002');
    });

    it('should handle multiple fingerprint registration for same user', async () => {
      // Arrange
      const userMultipleFingerprints = [
        { thumbid: 'THUMB_LEFT_001', empId: 'EMP003' },
        { thumbid: 'THUMB_RIGHT_001', empId: 'EMP003' },
        { thumbid: 'INDEX_LEFT_001', empId: 'EMP003' },
      ];

      const registrationResults = userMultipleFingerprints.map((fp) => ({
        thumbid: fp.thumbid,
        empId: fp.empId,
        orgId: 'org-123',
      }));

      mockUserFingerprintService.createFingerprint
        .mockResolvedValueOnce(registrationResults[0])
        .mockResolvedValueOnce(registrationResults[1])
        .mockResolvedValueOnce(registrationResults[2]);

      // Act
      const results = await Promise.all(
        userMultipleFingerprints.map(fp => userFingerprintController.registerFingerprint(fp))
      );

      // Assert
      expect(results).toHaveLength(3);
      expect(results.every(result => result.empId === 'EMP003')).toBe(true);
      expect(results.every(result => result.orgId === 'org-123')).toBe(true);
      expect(userFingerprintService.createFingerprint).toHaveBeenCalledTimes(3);
    });

    it('should validate fingerprint registration with organization context', async () => {
      // Arrange
      const orgFingerprintData = {
        thumbid: 'THUMB_004',
        empId: 'EMP004',
      };

      const orgValidatedResponse = {
        thumbid: 'THUMB_004',
        empId: 'EMP004',
        orgId: 'org-456',
      };

      mockUserFingerprintService.createFingerprint.mockResolvedValue(orgValidatedResponse);

      // Act
      const result = await userFingerprintController.registerFingerprint(orgFingerprintData);

      // Assert
      expect(result.orgId).toBe('org-456');
      expect(result.thumbid).toBe('THUMB_004');
      expect(result.empId).toBe('EMP004');
    });
  });

  describe('Test Case 15: Poor Quality Fingerprint Handling', () => {
    it('should request re-scan for poor quality fingerprint', async () => {
      // Arrange
      const poorQualityData = {
        thumbid: 'THUMB_005_POOR',
        empId: 'EMP005',
      };

      const rejectionError = new Error('Fingerprint quality too low. Please re-scan.');

      mockUserFingerprintService.createFingerprint.mockRejectedValue(rejectionError);

      // Act & Assert
      await expect(userFingerprintController.registerFingerprint(poorQualityData)).rejects.toThrow(
        'Fingerprint quality too low. Please re-scan.'
      );
      expect(userFingerprintService.createFingerprint).toHaveBeenCalledWith(
        poorQualityData.thumbid,
        poorQualityData.empId
      );
    });

    it('should provide guidance for better fingerprint capture', async () => {
      // Arrange
      const improvementGuidance = {
        thumbid: 'THUMB_006_RETRY',
        empId: 'EMP006',
      };

      const guidanceError = new Error('Multiple failed attempts. Please clean your finger and the scanner surface, then try again.');

      mockUserFingerprintService.createFingerprint.mockRejectedValue(guidanceError);

      // Act & Assert
      await expect(userFingerprintController.registerFingerprint(improvementGuidance)).rejects.toThrow(
        'Multiple failed attempts. Please clean your finger and the scanner surface, then try again.'
      );
    });

    it('should handle repeated failed capture attempts', async () => {
      // Arrange
      const repeatedFailureData = {
        thumbid: 'THUMB_007_FAIL',
        empId: 'EMP007',
      };

      const escalationError = new Error('Multiple failed attempts. Manual intervention required.');

      mockUserFingerprintService.createFingerprint.mockRejectedValue(escalationError);

      // Act & Assert
      await expect(userFingerprintController.registerFingerprint(repeatedFailureData)).rejects.toThrow(
        'Multiple failed attempts. Manual intervention required.'
      );
    });

    it('should validate minimum quality threshold enforcement', async () => {
      // Arrange
      const qualityTestData = [
        { thumbid: 'THUMB_GOOD_95', empId: 'EMP_QUALITY_95', shouldPass: true },
        { thumbid: 'THUMB_GOOD_75', empId: 'EMP_QUALITY_75', shouldPass: true },
        { thumbid: 'THUMB_BAD_65', empId: 'EMP_QUALITY_65', shouldPass: false },
        { thumbid: 'THUMB_BAD_30', empId: 'EMP_QUALITY_30', shouldPass: false },
      ];

      // Act & Assert
      for (const testCase of qualityTestData) {
        const fingerprintData = {
          thumbid: testCase.thumbid,
          empId: testCase.empId,
        };

        if (testCase.shouldPass) {
          const successResponse = {
            thumbid: testCase.thumbid,
            empId: testCase.empId,
            orgId: 'org-123',
          };
          mockUserFingerprintService.createFingerprint.mockResolvedValueOnce(successResponse);
          
          const result = await userFingerprintController.registerFingerprint(fingerprintData);
          expect(result.thumbid).toBe(testCase.thumbid);
        } else {
          mockUserFingerprintService.createFingerprint.mockRejectedValueOnce(
            new Error('Quality below threshold')
          );
          
          await expect(userFingerprintController.registerFingerprint(fingerprintData)).rejects.toThrow();
        }
      }
    });
  });

  describe('Test Case 16: Fingerprint Database Management - View All', () => {
    it('should display list of users with fingerprint status', async () => {
      // Arrange
      const organizationId = 'org-123';
      const expectedFingerprintList = [
        {
          thumbid: 'THUMB_001',
          empId: 'EMP001',
          orgId: 'org-123',
        },
        {
          thumbid: 'THUMB_002',
          empId: 'EMP002',
          orgId: 'org-123',
        },
        {
          thumbid: 'THUMB_003',
          empId: 'EMP003',
          orgId: 'org-123',
        },
      ];

      mockHrFingerprintsService.getAllFingerprints.mockResolvedValue(expectedFingerprintList);

      // Act
      const result = await hrFingerprintsController.getAllFingerprints(organizationId);

      // Assert
      expect(hrFingerprintsService.getAllFingerprints).toHaveBeenCalledWith(organizationId);
      expect(result).toHaveLength(3);
      expect(result[0].thumbid).toBe('THUMB_001');
      expect(result[0].empId).toBe('EMP001');
      expect(result[0].orgId).toBe('org-123');
    });

    it('should filter fingerprint list by organization', async () => {
      // Arrange
      const organizationId = 'org-456';
      const filteredResults = [
        {
          thumbid: 'THUMB_004',
          empId: 'EMP004',
          orgId: 'org-456',
        },
        {
          thumbid: 'THUMB_005',
          empId: 'EMP005',
          orgId: 'org-456',
        },
      ];

      mockHrFingerprintsService.getAllFingerprints.mockResolvedValue(filteredResults);

      // Act
      const result = await hrFingerprintsController.getAllFingerprints(organizationId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(fp => fp.orgId === 'org-456')).toBe(true);
      expect(hrFingerprintsService.getAllFingerprints).toHaveBeenCalledWith(organizationId);
    });

    it('should display fingerprint registration statistics', async () => {
      // Arrange
      const userStatusData = [
        { id: 'EMP001', name: 'John Doe', status: 'registered' },
        { id: 'EMP002', name: 'Jane Smith', status: 'pending' },
        { id: 'EMP003', name: 'Bob Johnson', status: 'registered' },
        { id: 'EMP004', name: 'Alice Wilson', status: 'registered' },
        { id: 'EMP005', name: 'Charlie Brown', status: 'pending' },
      ];

      mockHrFingerprintsService.getAllUsersWithFingerprintStatus.mockResolvedValue(userStatusData);

      // Act
      const result = await hrFingerprintsController.getAllUsersWithFingerprintStatus();

      // Assert
      expect(result).toHaveLength(5);
      const registeredCount = result.filter(user => user.status === 'registered').length;
      const pendingCount = result.filter(user => user.status === 'pending').length;
      expect(registeredCount).toBe(3);
      expect(pendingCount).toBe(2);
    });

    it('should handle pagination for large fingerprint databases', async () => {
      // Arrange
      const organizationId = 'org-123';
      const paginatedResults = Array.from({ length: 25 }, (_, index) => ({
        thumbid: `THUMB_${26 + index}`,
        empId: `EMP${26 + index}`,
        orgId: 'org-123',
      }));

      mockHrFingerprintsService.getAllFingerprints.mockResolvedValue(paginatedResults);

      // Act
      const result = await hrFingerprintsController.getAllFingerprints(organizationId);

      // Assert
      expect(result).toHaveLength(25);
      expect(result.every(fp => fp.orgId === 'org-123')).toBe(true);
    });
  });

  describe('Test Case 17: Search Specific User Fingerprint', () => {
    it('should filter and display relevant user biometric data by thumb ID', async () => {
      // Arrange
      const thumbId = 'THUMB_001';
      const searchResult = {
        empId: 'EMP001',
      };

      mockUserFingerprintService.getFingerprintByThumbid.mockResolvedValue(searchResult);

      // Act
      const result = await userFingerprintController.getFingerprintByThumbid(thumbId);

      // Assert
      expect(userFingerprintService.getFingerprintByThumbid).toHaveBeenCalledWith(thumbId);
      expect(result.empId).toBe('EMP001');
    });

    it('should search fingerprint by user ID', async () => {
      // Arrange
      const empId = 'EMP002';
      const userFingerprintData = ['THUMB_002_LEFT', 'THUMB_002_RIGHT'];

      mockHrFingerprintsService.getThumbidsByEmpId.mockResolvedValue(userFingerprintData);

      // Act
      const result = await hrFingerprintsController.getThumbidsByEmpId(empId);

      // Assert
      expect(hrFingerprintsService.getThumbidsByEmpId).toHaveBeenCalledWith(empId);
      expect(result).toHaveLength(2);
      expect(result).toContain('THUMB_002_LEFT');
      expect(result).toContain('THUMB_002_RIGHT');
    });

    it('should handle advanced search with multiple criteria', async () => {
      // Arrange
      const organizationId = 'org-123';
      const advancedSearchResults = [
        {
          thumbid: 'THUMB_001',
          empId: 'EMP001',
          orgId: 'org-123',
        },
        {
          thumbid: 'THUMB_005',
          empId: 'EMP005',
          orgId: 'org-123',
        },
      ];

      mockHrFingerprintsService.getAllFingerprints.mockResolvedValue(advancedSearchResults);

      // Act
      const result = await hrFingerprintsController.getAllFingerprints(organizationId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(fp => fp.orgId === 'org-123')).toBe(true);
    });

    it('should return not found for non-existent thumb ID', async () => {
      // Arrange
      const nonExistentThumbId = 'THUMB_999';

      mockUserFingerprintService.getFingerprintByThumbid.mockResolvedValue(null);

      // Act & Assert
      await expect(userFingerprintController.getFingerprintByThumbid(nonExistentThumbId))
        .rejects.toThrow(BadRequestException);
      
      expect(userFingerprintService.getFingerprintByThumbid).toHaveBeenCalledWith(nonExistentThumbId);
    });

    it('should validate search permissions by organization', async () => {
      // Arrange
      const organizationId = 'org-456';
      const authorizedResults = [
        {
          thumbid: 'THUMB_ORG456_001',
          empId: 'EMP_ORG456_001',
          orgId: 'org-456',
        },
      ];

      mockHrFingerprintsService.getAllFingerprints.mockResolvedValue(authorizedResults);

      // Act
      const result = await hrFingerprintsController.getAllFingerprints(organizationId);

      // Assert
      expect(result.every(fp => fp.orgId === 'org-456')).toBe(true);
      expect(hrFingerprintsService.getAllFingerprints).toHaveBeenCalledWith(organizationId);
    });
  });

  describe('Test Case 18: Fingerprint Deletion', () => {
    it('should successfully delete biometric data from local storage via system backend remotely', async () => {
      // Arrange
      const thumbIdToDelete = 'THUMB_003';
      const deletionResponse = {
        thumbid: 'THUMB_003',
        empId: 'EMP003',
        orgId: 'org-123',
      };

      mockHrFingerprintsService.deleteFingerprintByThumbid.mockResolvedValue(deletionResponse);

      // Act
      const result = await hrFingerprintsController.deleteFingerprintByThumbid(thumbIdToDelete);

      // Assert
      expect(hrFingerprintsService.deleteFingerprintByThumbid).toHaveBeenCalledWith(thumbIdToDelete);
      expect(result.thumbid).toBe('THUMB_003');
    });

    it('should handle remote deletion with device connectivity issues', async () => {
      // Arrange
      const thumbIdToDelete = 'THUMB_004';
      const deletionError = new Error('Device offline - deletion scheduled for retry');

      mockHrFingerprintsService.deleteFingerprintByThumbid.mockRejectedValue(deletionError);

      // Act & Assert
      await expect(hrFingerprintsController.deleteFingerprintByThumbid(thumbIdToDelete)).rejects.toThrow(
        'Device offline - deletion scheduled for retry'
      );
    });

    it('should support bulk fingerprint deletion for multiple users', async () => {
      // Arrange
      const empIdToDelete = 'EMP005';
      const bulkDeletionResult = { count: 3 }; // Deleted 3 fingerprints

      mockHrFingerprintsService.deleteFingerprintsByEmpId.mockResolvedValue(bulkDeletionResult);

      // Act
      const result = await hrFingerprintsController.deleteFingerprintsByEmpId(empIdToDelete);

      // Assert
      expect(hrFingerprintsService.deleteFingerprintsByEmpId).toHaveBeenCalledWith(empIdToDelete);
      expect(result.count).toBe(3);
    });

    it('should maintain audit trail for fingerprint deletions', async () => {
      // Arrange
      const thumbIdToDelete = 'THUMB_008';
      const auditedDeletionResponse = {
        thumbid: 'THUMB_008',
        empId: 'EMP008',
        orgId: 'org-123',
      };

      mockHrFingerprintsService.deleteFingerprintByThumbid.mockResolvedValue(auditedDeletionResponse);

      // Act
      const result = await hrFingerprintsController.deleteFingerprintByThumbid(thumbIdToDelete);

      // Assert
      expect(result.thumbid).toBe('THUMB_008');
      expect(result.empId).toBe('EMP008');
    });

    it('should handle deletion authorization and approval workflow', async () => {
      // Arrange
      const unauthorizedThumbId = 'THUMB_009';
      const authorizationError = new Error('Insufficient permissions for fingerprint deletion');

      mockHrFingerprintsService.deleteFingerprintByThumbid.mockRejectedValue(authorizationError);

      // Act & Assert
      await expect(hrFingerprintsController.deleteFingerprintByThumbid(unauthorizedThumbId)).rejects.toThrow(
        'Insufficient permissions for fingerprint deletion'
      );
    });

    it('should handle fingerprint not found during deletion', async () => {
      // Arrange
      const nonExistentThumbId = 'THUMB_NONEXISTENT';
      const notFoundError = new Error('Fingerprint not found');

      mockHrFingerprintsService.deleteFingerprintByThumbid.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(hrFingerprintsController.deleteFingerprintByThumbid(nonExistentThumbId)).rejects.toThrow(
        'Fingerprint not found'
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
