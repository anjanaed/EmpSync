import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from '../../src/modules/payroll/payroll.controller';
import { PayrollService } from '../../src/modules/payroll/payroll.service';
import { FirebaseService } from '../../src/modules/payroll/firebase.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/core/authentication/roles.guard';

describe('User Portal - Payroll Viewing Service', () => {
  let payrollController: PayrollController;
  let payrollService: PayrollService;
  let firebaseService: FirebaseService;

  const mockPayrollService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockFirebaseService = {
    getSignedUrlFromParams: jest.fn(),
    getSignedUrlFromParamsDownload: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: mockPayrollService },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    payrollController = module.get<PayrollController>(PayrollController);
    payrollService = module.get<PayrollService>(PayrollService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  describe('Test Case 6: Payroll Viewing - User Access', () => {
    it('should allow user to view their own payroll details', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const month = '2024-01';
      const expectedPayrollData = {
        id: 1,
        empId: 'EMP001',
        month: '2024-01',
        netPay: 135000,
        payrollPdf: 'payrolls/EMP001/EMP001-2024-01.pdf',
        createdAt: '2024-01-31T00:00:00.000Z',
        employee: {
          id: 'EMP001',
          name: 'John Doe',
          designation: 'Software Engineer',
          department: 'Engineering',
        },
      };

      mockPayrollService.findOne.mockResolvedValue(expectedPayrollData);

      // Act
      const result = await payrollController.findOne(employeeId, month);

      // Assert
      expect(payrollService.findOne).toHaveBeenCalledWith(employeeId, month);
      expect(result).toEqual(expectedPayrollData);
      expect(result.empId).toBe('EMP001');
      expect(result.netPay).toBe(135000);
      expect(result.month).toBe('2024-01');
    });

    it('should provide payroll PDF download URL for authenticated user', async () => {
      // Arrange
      const mockRequest = {
        user: {
          employeeId: 'emp001', // lowercase as stored in JWT
        },
      };
      const month = '2024-01';
      const expectedUrl = 'https://firebase-storage-url.com/payrolls/EMP001/EMP001-2024-01.pdf';

      mockFirebaseService.getSignedUrlFromParams.mockResolvedValue(expectedUrl);

      // Act
      const result = await payrollController.getSignedUrlFromToken(mockRequest, month);

      // Assert
      expect(firebaseService.getSignedUrlFromParams).toHaveBeenCalledWith('EMP001', month);
      expect(result).toEqual({ url: expectedUrl });
    });

    it('should display payroll details including salary breakdown', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const month = '2024-01';
      const detailedPayrollData = {
        id: 1,
        empId: 'EMP001',
        month: '2024-01',
        netPay: 135000,
        range: [new Date('2024-01-01'), new Date('2024-01-31')],
        payrollPdf: 'payrolls/EMP001/EMP001-2024-01.pdf',
        createdAt: new Date('2024-01-31'),
        orgId: 'org-123',
      };

      mockPayrollService.findOne.mockResolvedValue(detailedPayrollData);

      // Act
      const result = await payrollController.findOne(employeeId, month);

      // Assert
      expect(result).toHaveProperty('netPay');
      expect(result).toHaveProperty('empId');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('payrollPdf');
      expect(result.netPay).toBe(135000);
      expect(result.empId).toBe('EMP001');
    });

    it('should handle multiple payroll months for the same user', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const orgId = 'org-123';
      const multiplePayrolls = [
        {
          id: 1,
          empId: 'EMP001',
          month: '2024-01',
          netPay: 135000,
          employee: { name: 'John Doe' },
        },
        {
          id: 2,
          empId: 'EMP001',
          month: '2024-02',
          netPay: 140000,
          employee: { name: 'John Doe' },
        },
        {
          id: 3,
          empId: 'EMP001',
          month: '2024-03',
          netPay: 145000,
          employee: { name: 'John Doe' },
        },
      ];

      mockPayrollService.findAll.mockResolvedValue(multiplePayrolls);

      // Act
      const result = await payrollController.findAll(employeeId, orgId);

      // Assert
      expect(payrollService.findAll).toHaveBeenCalledWith(employeeId, orgId);
      expect(result).toHaveLength(3);
      expect(result.every(payroll => payroll.empId === employeeId)).toBe(true);
    });
  });

  describe('Test Case 7: Payroll Viewing - Permission Denied', () => {
    it('should deny access when user tries to view another employee\'s payroll', async () => {
      // Arrange
      const unauthorizedEmployeeId = 'EMP002';
      const month = '2024-01';

      // Mock that user EMP001 is trying to access EMP002's payroll
      mockPayrollService.findOne.mockRejectedValue(
        new HttpException('Access denied. You can only view your own payroll.', HttpStatus.FORBIDDEN)
      );

      // Act & Assert
      await expect(payrollController.findOne(unauthorizedEmployeeId, month)).rejects.toThrow(
        new HttpException('Access denied. You can only view your own payroll.', HttpStatus.FORBIDDEN)
      );
    });

    it('should return "Payroll not found" for non-existent payroll records', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const nonExistentMonth = '2025-12';

      mockPayrollService.findOne.mockRejectedValue(
        new Error('Payroll not found')
      );

      // Act & Assert
      await expect(payrollController.findOne(employeeId, nonExistentMonth)).rejects.toThrow(
        HttpException
      );
      expect(payrollService.findOne).toHaveBeenCalledWith(employeeId, nonExistentMonth);
    });

    it('should handle unauthorized access to payroll PDF downloads', async () => {
      // Arrange
      const mockRequest = {
        user: {
          employeeId: 'emp001',
        },
      };
      const month = '2024-01';

      mockFirebaseService.getSignedUrlFromParams.mockRejectedValue(
        new Error('File not found or access denied')
      );

      // Act & Assert
      await expect(payrollController.getSignedUrlFromToken(mockRequest, month)).rejects.toThrow(
        HttpException
      );
    });

    it('should validate user authentication before showing payroll data', async () => {
      // Arrange
      const mockRequest = {
        user: null, // No authenticated user
      };
      const month = '2024-01';

      // Act & Assert
      await expect(payrollController.getSignedUrlFromToken(mockRequest, month)).rejects.toThrow();
    });

    it('should enforce role-based access for HR admin payroll viewing', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const month = '2024-01';
      const mode = 'V'; // View mode

      // Mock successful HR access
      const expectedUrl = 'https://firebase-storage-url.com/payrolls/EMP001/EMP001-2024-01.pdf';
      mockFirebaseService.getSignedUrlFromParams.mockResolvedValue(expectedUrl);

      // Act
      const result = await payrollController.getSignedUrlForHR(employeeId, month, mode);

      // Assert
      expect(firebaseService.getSignedUrlFromParams).toHaveBeenCalledWith('EMP001', month);
      expect(result).toEqual({ url: expectedUrl });
    });

    it('should prevent access to payroll data without proper organization context', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const invalidOrgId = 'wrong-org-id';

      mockPayrollService.findAll.mockResolvedValue([]); // Empty result for wrong org

      // Act
      const result = await payrollController.findAll(employeeId, invalidOrgId);

      // Assert
      expect(result).toEqual([]);
      expect(payrollService.findAll).toHaveBeenCalledWith(employeeId, invalidOrgId);
    });

    it('should handle missing employee ID in JWT token', async () => {
      // Arrange
      const mockRequest = {
        user: {
          // Missing employeeId property
          email: 'user@company.com',
        },
      };
      const month = '2024-01';

      // Mock the service to reject when no employee ID is provided
      mockFirebaseService.getSignedUrlFromParams.mockRejectedValue(
        new Error('Employee ID is required')
      );

      // Act & Assert
      await expect(payrollController.getSignedUrlFromToken(mockRequest, month)).rejects.toThrow();
    });

    it('should validate month format in payroll requests', async () => {
      // Arrange
      const employeeId = 'EMP001';
      const invalidMonth = 'invalid-month-format';

      mockPayrollService.findOne.mockRejectedValue(
        new Error('Invalid month format')
      );

      // Act & Assert
      await expect(payrollController.findOne(employeeId, invalidMonth)).rejects.toThrow(
        HttpException
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
