import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { DatabaseService } from '../../database/database.service';
import { FirebaseService } from './firebase.service';
import { OrdersService } from '../order/order.service';
import { HttpException, HttpStatus } from '@nestjs/common';


jest.mock('./payroll-cal/calculator', () => ({
  calculateSalary: jest.fn(() => ({ netSalary: 1000 })),
}));

jest.mock('./payroll-cal/pdf-gen', () => ({
  generatePayslip: jest.fn(),
}));

describe('PayrollService', () => {
  let service: PayrollService;
  let db: any;
  let firebase: any;
  let ordersService: any;

  beforeEach(async () => {

    db = {
      payroll: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: { findMany: jest.fn() },
      payeTaxSlab: { findMany: jest.fn() },
      salaryAdjustments: { findMany: jest.fn() },
      individualSalaryAdjustments: { findMany: jest.fn() },
    };

    // Mock FirebaseService
    firebase = { 
      uploadFile: jest.fn(),
    };

    // Mock OrdersService
    ordersService = {
      getMealCost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: DatabaseService, useValue: db },
        { provide: FirebaseService, useValue: firebase },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create payroll successfully', async () => {
      const dto = { empId: '1', month: '2024-06', orgId: 'org1' } as any;
      const expectedResult = { id: 1, ...dto };
      
      db.payroll.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);

      expect(result).toEqual(expectedResult);
      expect(db.payroll.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw HttpException on create error', async () => {
      const dto = { empId: '1', month: '2024-06', orgId: 'org1' } as any;
      const errorMessage = 'Database error';
      
      db.payroll.create.mockRejectedValue(new Error(errorMessage));

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('findUserPayrolls', () => {
    it('should return user payrolls successfully', async () => {
      const empId = 'emp1';
      const mockPayrolls = [
        {
          id: 1,
          empId,
          employee: { id: 'emp1', name: 'John Doe', email: 'john@example.com' }
        }
      ];

      db.payroll.findMany.mockResolvedValue(mockPayrolls);

      const result = await service.findUserPayrolls(empId);

      expect(result).toEqual({
        success: true,
        message: 'Payrolls fetched successfully',
        payrolls: mockPayrolls,
      });
      expect(db.payroll.findMany).toHaveBeenCalledWith({
        where: { empId },
        include: {
          employee: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no payrolls found', async () => {
      const empId = 'emp1';
      
      db.payroll.findMany.mockResolvedValue([]);

      const result = await service.findUserPayrolls(empId);

      expect(result).toEqual({
        success: true,
        message: 'No payroll records found',
        payrolls: [],
      });
    });

    it('should throw HttpException on database error', async () => {
      const empId = 'emp1';
      const errorMessage = 'Database connection failed';
      
      db.payroll.findMany.mockRejectedValue(new Error(errorMessage));

      await expect(service.findUserPayrolls(empId)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('findAll', () => {
    it('should find all payrolls with orgId filter', async () => {
      const mockPayrolls = [{ id: 1, orgId: 'org1', employee: {} }];
      
      db.payroll.findMany.mockResolvedValue(mockPayrolls);

      const result = await service.findAll(undefined, 'org1');

      expect(result).toEqual(mockPayrolls);
      expect(db.payroll.findMany).toHaveBeenCalledWith({
        include: { employee: true },
        where: { orgId: 'org1' },
      });
    });

    it('should find payrolls with search filter', async () => {
      const mockPayrolls = [{ id: 1, empId: 'emp1', employee: {} }];
      
      db.payroll.findMany.mockResolvedValue(mockPayrolls);

      const result = await service.findAll('emp1', 'org1');

      expect(result).toEqual(mockPayrolls);
      expect(db.payroll.findMany).toHaveBeenCalledWith({
        include: { employee: true },
        where: {
          orgId: 'org1',
          OR: [{ empId: { contains: 'emp1', mode: 'insensitive' } }],
        },
      });
    });

    it('should throw HttpException on database error', async () => {
      const errorMessage = 'Database error';
      
      db.payroll.findMany.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAll()).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('findOne', () => {
    it('should find one payroll successfully', async () => {
      const empId = 'emp1';
      const month = '2024-06';
      const mockPayroll = { id: 1, empId, month };
      
      db.payroll.findFirst.mockResolvedValue(mockPayroll);

      const result = await service.findOne(empId, month);

      expect(result).toEqual(mockPayroll);
      expect(db.payroll.findFirst).toHaveBeenCalledWith({
        where: { empId, month },
      });
    });

    it('should throw HttpException when payroll not found', async () => {
      const empId = 'emp1';
      const month = '2024-06';
      
      db.payroll.findFirst.mockResolvedValue(null);

      await expect(service.findOne(empId, month)).rejects.toThrow(
        new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('update', () => {
    it('should update payroll successfully', async () => {
      const id = 1;
      const dto = { netPay: 1000 };
      const mockPayroll = { id, empId: 'emp1' };
      
      db.payroll.findUnique.mockResolvedValue(mockPayroll);
      db.payroll.update.mockResolvedValue({ ...mockPayroll, ...dto });

      await service.update(id, dto);

      expect(db.payroll.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(db.payroll.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
    });

    it('should throw HttpException when payroll not found for update', async () => {
      const id = 1;
      const dto = { netPay: 1000 };
      
      db.payroll.findUnique.mockResolvedValue(null);

      await expect(service.update(id, dto)).rejects.toThrow(
        new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('remove', () => {
    it('should remove payroll successfully', async () => {
      const id = 1;
      const mockPayroll = { id, empId: 'emp1' };
      
      db.payroll.findUnique.mockResolvedValue(mockPayroll);
      db.payroll.delete.mockResolvedValue(mockPayroll);

      await service.remove(id);

      expect(db.payroll.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(db.payroll.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw HttpException when payroll not found for removal', async () => {
      const id = 1;
      
      db.payroll.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('deleteByMonthAndEmp', () => {
    it('should delete payrolls by empId and month successfully', async () => {
      const empId = 'emp1';
      const month = '2024-06';
      const mockResult = { count: 1 };
      
      db.payroll.deleteMany.mockResolvedValue(mockResult);

      const result = await service.deleteByMonthAndEmp(empId, month);

      expect(result).toEqual(mockResult);
      expect(db.payroll.deleteMany).toHaveBeenCalledWith({
        where: { empId, month },
      });
    });

    it('should throw error on database failure', async () => {
      const empId = 'emp1';
      const month = '2024-06';
      
      db.payroll.deleteMany.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteByMonthAndEmp(empId, month)).rejects.toThrow(
        'Failed to delete payroll(s) for employee and month'
      );
    });
  });

  describe('deleteByMonth', () => {
    it('should delete payrolls by month and orgId successfully', async () => {
      const month = '2024-06';
      const orgId = 'org1';
      const mockResult = { count: 3 };
      
      db.payroll.deleteMany.mockResolvedValue(mockResult);

      const result = await service.deleteByMonth(month, orgId);

      expect(result).toEqual({ deletedCount: 3 });
      expect(db.payroll.deleteMany).toHaveBeenCalledWith({
        where: { month, orgId },
      });
    });

    it('should throw error on database failure', async () => {
      const month = '2024-06';
      const orgId = 'org1';
      const errorMessage = 'Database error';
      
      db.payroll.deleteMany.mockRejectedValue(new Error(errorMessage));

      await expect(service.deleteByMonth(month, orgId)).rejects.toThrow(Error);
    });
  });

  describe('generatePayrollsForAll', () => {
    it('should generate payrolls for all users successfully', async () => {
      const dto = {
        range: ['2024-06-01T00:00:00.000Z', '2024-06-30T23:59:59.999Z'],
        month: '06~2024',
        orgId: 'org1'
      } as any;

      const mockUsers = [
        { id: 'user1', salary: 50000, name: 'John Doe' },
        { id: 'user2', salary: 60000, name: 'Jane Smith' }
      ];

      const mockPayeData = [{ bracket: 1, rate: 10 }];
      const mockAdjustments = [
        { label: 'EmployerFund', amount: 12, isPercentage: true, allowance: false },
        { label: 'ETF', amount: 3, isPercentage: true, allowance: false }
      ];
      const mockIndividualAdjustments = [];

      db.user.findMany.mockResolvedValue(mockUsers);
      db.payeTaxSlab.findMany.mockResolvedValue(mockPayeData);
      db.salaryAdjustments.findMany.mockResolvedValue(mockAdjustments);
      db.individualSalaryAdjustments.findMany.mockResolvedValue(mockIndividualAdjustments);
      ordersService.getMealCost.mockResolvedValue({ mealCost: 500 });
      db.payroll.create.mockResolvedValue({ id: 1, createdAt: new Date() });

      await service.generatePayrollsForAll(dto, 'org1');

      expect(db.user.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org1' },
      });
      expect(db.payroll.create).toHaveBeenCalledTimes(mockUsers.length);
    });
  });
});