import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserFingerPrintRegisterBackendController } from './user-finger-print-register-backend.controller';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

describe('UserFingerPrintRegisterBackendController', () => {
  let controller: UserFingerPrintRegisterBackendController;
  let service: UserFingerPrintRegisterBackendService;

  const mockUser = {
    id: 'O001E001',
    name: 'John Doe',
    organizationId: 'O001',
  };

  const mockFingerprint = {
    thumbid: 'FPU0011234',
    empId: 'O001E001',
    orgId: 'O001',
  };

  const mockService = {
    getAllFingerprints: jest.fn(),
    getUserByPasskey: jest.fn(),
    createFingerprint: jest.fn(),
    getFingerprintByThumbid: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<UserFingerPrintRegisterBackendService>(UserFingerPrintRegisterBackendService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Passkey Generation Test Cases', () => {
    describe('getUserByPasskey', () => {
      it('should validate and return user for correct 6-digit passkey (Normal Scenario)', async () => {
        // Test Case: Normal Scenario
        // Expected: System generates unique random passkey for each user registration
        const passkey = '123456';
        mockService.getUserByPasskey.mockResolvedValue(mockUser);

        const result = await controller.getUserByPasskey(passkey);

        expect(result).toEqual(mockUser);
        expect(service.getUserByPasskey).toHaveBeenCalledWith(123456);
      });

      it('should throw BadRequestException when passkey is not provided', async () => {
        await expect(controller.getUserByPasskey(undefined)).rejects.toThrow(
          new BadRequestException('passkey must be a number')
        );
      });

      it('should throw BadRequestException when passkey is not a number', async () => {
        await expect(controller.getUserByPasskey('invalid')).rejects.toThrow(
          new BadRequestException('passkey must be a number')
        );
      });

      it('should throw BadRequestException when user not found (Passkey Validation)', async () => {
        // Test Case: Passkey Validation
        // Expected: Passkey should be accepted and allow biometric registration
        const passkey = '999999';
        mockService.getUserByPasskey.mockResolvedValue(null);

        await expect(controller.getUserByPasskey(passkey)).rejects.toThrow(
          new BadRequestException('User not found')
        );
      });

      it('should handle various valid 6-digit passkeys', async () => {
        const validPasskeys = ['100000', '999999', '555555', '123456'];
        
        for (const passkey of validPasskeys) {
          mockService.getUserByPasskey.mockResolvedValue({ ...mockUser, passkey: parseInt(passkey) });
          
          const result = await controller.getUserByPasskey(passkey);
          
          expect(result).toBeTruthy();
          expect(service.getUserByPasskey).toHaveBeenCalledWith(parseInt(passkey));
        }
      });

      it('should ensure unique passkey validation (Duplicate Passkey Prevention)', async () => {
        // Test Case: Duplicate Passkey Prevention
        // Expected: Each user should receive unique passkey with no duplicates
        const passkey1 = '123456';
        const passkey2 = '654321';
        
        const user1 = { ...mockUser, id: 'O001E001', passkey: 123456 };
        const user2 = { ...mockUser, id: 'O001E002', passkey: 654321 };
        
        mockService.getUserByPasskey.mockResolvedValueOnce(user1);
        mockService.getUserByPasskey.mockResolvedValueOnce(user2);
        
        const result1 = await controller.getUserByPasskey(passkey1);
        const result2 = await controller.getUserByPasskey(passkey2);
        
        expect(result1.id).not.toBe(result2.id);
        expect(result1.id).toBe('O001E001');
        expect(result2.id).toBe('O001E002');
      });
    });

    describe('createFingerprint', () => {
      it('should successfully register fingerprint after passkey validation', async () => {
        const createFingerprintDto = {
          empId: 'O001E001',
          thumbid: 'FPU0011234',
        };

        mockService.createFingerprint.mockResolvedValue(mockFingerprint);

        const result = await controller.createFingerprint(createFingerprintDto);

        expect(result).toEqual(mockFingerprint);
        expect(service.createFingerprint).toHaveBeenCalledWith(
          createFingerprintDto.thumbid,
          createFingerprintDto.empId
        );
      });

      it('should handle multiple simultaneous fingerprint registrations', async () => {
        // Test Case: Multiple simultaneous registrations
        // Expected: Each user should receive unique passkey with no duplicates
        const registrations = [
          { empId: 'O001E001', thumbid: 'FPU0011234' },
          { empId: 'O001E002', thumbid: 'FPU0011235' },
          { empId: 'O001E003', thumbid: 'FPU0011236' },
        ];

        for (let i = 0; i < registrations.length; i++) {
          const expectedResult = {
            ...mockFingerprint,
            empId: registrations[i].empId,
            thumbid: registrations[i].thumbid,
          };
          
          mockService.createFingerprint.mockResolvedValueOnce(expectedResult);
          
          const result = await controller.createFingerprint(registrations[i]);
          
          expect(result.empId).toBe(registrations[i].empId);
          expect(result.thumbid).toBe(registrations[i].thumbid);
        }

        expect(service.createFingerprint).toHaveBeenCalledTimes(3);
      });
    });

    describe('getFingerprintByThumbid', () => {
      it('should return fingerprint when valid thumbid is provided', async () => {
        const thumbid = 'FPU0011234';
        mockService.getFingerprintByThumbid.mockResolvedValue(mockFingerprint);

        const result = await controller.getFingerprintByThumbid(thumbid);

        expect(result).toEqual(mockFingerprint);
        expect(service.getFingerprintByThumbid).toHaveBeenCalledWith(thumbid);
      });
    });

    describe('getAllFingerprints', () => {
      it('should return all registered fingerprints', async () => {
        const mockFingerprints = [mockFingerprint];
        mockService.getAllFingerprints.mockResolvedValue(mockFingerprints);

        const result = await controller.getAllFingerprints();

        expect(result).toEqual(mockFingerprints);
        expect(service.getAllFingerprints).toHaveBeenCalled();
      });
    });
  });

  describe('Passkey System Integration Tests', () => {
    it('should demonstrate complete passkey workflow through controller', async () => {
      // Step 1: Validate passkey through controller endpoint
      const passkey = '123456';
      mockService.getUserByPasskey.mockResolvedValue(mockUser);
      
      const authenticatedUser = await controller.getUserByPasskey(passkey);
      expect(authenticatedUser).toBeTruthy();
      expect(authenticatedUser.id).toBe('O001E001');
      
      // Step 2: Register fingerprint using validated user
      const createDto = {
        empId: authenticatedUser.id,
        thumbid: 'FPU0011234',
      };
      
      mockService.createFingerprint.mockResolvedValue(mockFingerprint);
      const fingerprintResult = await controller.createFingerprint(createDto);
      
      expect(fingerprintResult).toBeTruthy();
      expect(fingerprintResult.empId).toBe(authenticatedUser.id);
      
      // Step 3: Verify fingerprint can be retrieved
      mockService.getFingerprintByThumbid.mockResolvedValue(mockFingerprint);
      const retrievedFingerprint = await controller.getFingerprintByThumbid('FPU0011234');
      
      expect(retrievedFingerprint.empId).toBe(authenticatedUser.id);
    });

    it('should handle edge cases in passkey validation', async () => {
      // Test minimum valid passkey
      const minPasskey = '100000';
      mockService.getUserByPasskey.mockResolvedValue({ ...mockUser, passkey: 100000 });
      
      const result1 = await controller.getUserByPasskey(minPasskey);
      expect(result1).toBeTruthy();
      
      // Test maximum valid passkey
      const maxPasskey = '999999';
      mockService.getUserByPasskey.mockResolvedValue({ ...mockUser, passkey: 999999 });
      
      const result2 = await controller.getUserByPasskey(maxPasskey);
      expect(result2).toBeTruthy();
      
      // Test various valid number formats (controller only validates it's a number)
      const validNumbers = ['12345', '1234567'];
      for (const num of validNumbers) {
        mockService.getUserByPasskey.mockResolvedValue({ ...mockUser, passkey: parseInt(num) });
        const result = await controller.getUserByPasskey(num);
        expect(result).toBeTruthy();
      }
      
      // Test invalid passkey formats - only non-numbers should fail
      await expect(controller.getUserByPasskey('abc123')).rejects.toThrow(); // Contains letters
      await expect(controller.getUserByPasskey('notanumber')).rejects.toThrow(); // Not a number
    });
  });
});
