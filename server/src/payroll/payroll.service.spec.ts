import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { DatabaseService } from '../database/database.service';
import { HttpException,HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PayrollService', () => {
  let payrollService: PayrollService;
  let databaseService: DatabaseService;
  const mockDatabaseService = {
    payroll: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    payrollService = module.get<PayrollService>(PayrollService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payroll successfully', async () => {
      const dto: Prisma.PayrollCreateInput = {
        id: '1',
        empId: 'E001',
        month: 'January',
        payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
        createdAt: new Date('2025-01-31T00:00:00.000Z'),
      };
      mockDatabaseService.payroll.create.mockResolvedValue(dto);

      await expect(payrollService.create(dto)).resolves.toEqual('Payroll Generated');
      expect(mockDatabaseService.payroll.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw an error if payroll creation fails', async () => {
      mockDatabaseService.payroll.create.mockRejectedValue(new HttpException('Bad Request', HttpStatus.BAD_REQUEST));

      const dto: Prisma.PayrollCreateInput = {
        id: '1',
        empId: 'E001',
        month: 'January',
        payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
        createdAt: new Date('2025-01-31T00:00:00.000Z'),
      };

      await expect(payrollService.create(dto)).rejects.toThrow(HttpException);
      expect(mockDatabaseService.payroll.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of payrolls', async () => {
      const mockPayrolls = [
        {
          id: '1',
          empId: 'E001',
          month: 'January',
          payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
          createdAt: new Date('2025-01-31T00:00:00.000Z'),
        },
      ];
      mockDatabaseService.payroll.findMany.mockResolvedValue(mockPayrolls);

      await expect(payrollService.findAll()).resolves.toEqual(mockPayrolls);
      expect(mockDatabaseService.payroll.findMany).toHaveBeenCalled();
    });

    it('should throw an error if no payrolls are found', async () => {
      mockDatabaseService.payroll.findMany.mockResolvedValue(null);

      await expect(payrollService.findAll()).rejects.toThrow('No Payrolls');
    });
  });

  describe('findOne', () => {
    it('should return a payroll by empId and month', async () => {
      const mockPayroll = {
        id: '1',
        empId: 'E001',
        month: 'January',
        payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
        createdAt: new Date('2025-01-31T00:00:00.000Z'),
      };
      mockDatabaseService.payroll.findFirst.mockResolvedValue(mockPayroll);

      await expect(payrollService.findOne('E001', 'January')).resolves.toEqual(mockPayroll);
      expect(mockDatabaseService.payroll.findFirst).toHaveBeenCalledWith({
        where: { empId: 'E001', month: 'January' },
      });
    });

    it('should throw an error if payroll is not found', async () => {
      mockDatabaseService.payroll.findFirst.mockResolvedValue(null);

      await expect(payrollService.findOne('E002', 'February')).rejects.toThrow('Payroll Not Found');
    });
  });

  describe('update', () => {
    it('should update a payroll if found', async () => {
      const mockPayroll = {
        id: '1',
        empId: 'E001',
        month: 'January',
        payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
        createdAt: new Date('2025-01-31T00:00:00.000Z'),
      };
      const updateData: Prisma.PayrollUpdateInput = { month: 'February' };

      mockDatabaseService.payroll.findUnique.mockResolvedValue(mockPayroll);
      mockDatabaseService.payroll.update.mockResolvedValue({ ...mockPayroll, ...updateData });

      await expect(payrollService.update('1', updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.payroll.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should throw an error if payroll is not found', async () => {
      mockDatabaseService.payroll.findUnique.mockResolvedValue(null);

      await expect(payrollService.update('2', { month: 'February' })).rejects.toThrow('Payroll Not Found');
    });
  });

  describe('remove', () => {
    it('should delete a payroll if found', async () => {
      const mockPayroll = {
        id: '1',
        empId: 'E001',
        month: 'January',
        payrollPdf: Buffer.from('U29tZSBiaW5hcnkgZGF0YQ==', 'base64'),
        createdAt: new Date('2025-01-31T00:00:00.000Z'),
      };
      mockDatabaseService.payroll.findUnique.mockResolvedValue(mockPayroll);
      mockDatabaseService.payroll.delete.mockResolvedValue(mockPayroll);

      await expect(payrollService.remove('1')).resolves.not.toThrow();
      expect(mockDatabaseService.payroll.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if payroll is not found', async () => {
      mockDatabaseService.payroll.findUnique.mockResolvedValue(null);

      await expect(payrollService.remove('2')).rejects.toThrow('Payroll Not Found');
    });
  });
});