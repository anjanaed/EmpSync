import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { DatabaseService } from '../../database/database.service';
import { FirebaseService } from './firebase.service';
import { HttpException } from '@nestjs/common';

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

    firebase = { uploadFile: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: DatabaseService, useValue: db },
        { provide: FirebaseService, useValue: firebase },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should create payroll', async () => {
    const dto = { empId: '1', month: '2024-06', orgId: 'org1' } as any;
    db.payroll.create.mockResolvedValue({ id: 1 });
    const result = await service.create(dto);
    expect(result).toEqual({ id: 1 });
    expect(db.payroll.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should throw on create error', async () => {
    db.payroll.create.mockRejectedValue(new Error('fail'));
    await expect(service.create({} as any)).rejects.toThrow(HttpException);
  });

  it('should find all payrolls', async () => {
    db.payroll.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll(undefined, 'org1');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should find one payroll', async () => {
    db.payroll.findFirst.mockResolvedValue({ id: 1 });
    const result = await service.findOne('emp1', '2024-06');
    expect(result).toEqual({ id: 1 });
  });

  it('should update payroll', async () => {
    db.payroll.findUnique.mockResolvedValue({ id: 1 });
    db.payroll.update.mockResolvedValue({});
    await service.update(1, { netPay: 1000 });
    expect(db.payroll.update).toHaveBeenCalled();
  });

  it('should remove payroll', async () => {
    db.payroll.findUnique.mockResolvedValue({ id: 1 });
    db.payroll.delete.mockResolvedValue({});
    await service.remove(1);
    expect(db.payroll.delete).toHaveBeenCalled();
  });

  it('should delete payrolls by empId and month', async () => {
    db.payroll.deleteMany.mockResolvedValue({ count: 1 });
    const result = await service.deleteByMonthAndEmp('emp1', '2024-06');
    expect(result).toEqual({ count: 1 });
  });

  it('should delete payrolls by month and orgId', async () => {
    db.payroll.deleteMany.mockResolvedValue({ count: 3 });
    const result = await service.deleteByMonth('2024-06', 'org1');
    expect(result).toEqual({ deletedCount: 3 });
  });
});
