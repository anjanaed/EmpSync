import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { FirebaseService } from './firebase.service';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';


const mockPayrollService = {
  generatePayrollsForAll: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  deleteByMonth: jest.fn(),
  deleteByMonthAndEmp: jest.fn(),
};

const mockFirebaseService = {
  uploadFile: jest.fn(),
  getSignedUrlFromParams: jest.fn(),
  getSignedUrlFromParamsDownload: jest.fn(),
  deleteFile: jest.fn(),
};
const mockDto: Prisma.PayrollCreateInput = {
  orgId: 'org123',
  month: '2025-07',
  netPay: 10000,
  payrollPdf: 'some-url',
  employee: {
    connect: { id: 'EMP001' }
  }
};


describe('PayrollController', () => {
  let controller: PayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: mockPayrollService },
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generatePayrollsForAll', () => {
    it('should return success message', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.generatePayrollsForAll(mockDto, 'org123', res as any);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Payrolls Generated' });
    });
  });

  describe('findAll', () => {
    it('should call payrollService.findAll with params', async () => {
      mockPayrollService.findAll.mockResolvedValue(['payroll1']);
      const result = await controller.findAll('searchTerm', 'org123');
      expect(mockPayrollService.findAll).toHaveBeenCalledWith('searchTerm', 'org123');
      expect(result).toEqual(['payroll1']);
    });
  });

  describe('findOne', () => {
    it('should return payroll record', async () => {
      mockPayrollService.findOne.mockResolvedValue({ id: 1 });
      const result = await controller.findOne('EMP001', '2025-07');
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should call payrollService.update', async () => {
      mockPayrollService.update.mockResolvedValue({});
      const result = await controller.update(1, {});
      expect(result).toEqual({});
    });
  });

  describe('remove', () => {
    it('should call payrollService.remove', async () => {
      mockPayrollService.remove.mockResolvedValue({});
      const result = await controller.remove(1);
      expect(result).toEqual({});
    });
  });

  describe('deletePayrollsByMonth', () => {
    it('should delete payrolls for month and org', async () => {
      mockPayrollService.deleteByMonth.mockResolvedValue({ deletedCount: 2 });
      const result = await controller.deletePayrollsByMonth('2025-07', 'org123');
      expect(result).toEqual({ deletedCount: 2 });
    });
  });

  describe('uploadPayrollPdf', () => {
    it('should upload file and return path', async () => {
      mockFirebaseService.uploadFile.mockResolvedValue('path/to/file.pdf');
      const result = await controller.uploadPayrollPdf('EMP001', { originalname: 'file.pdf', buffer: Buffer.from('') } as any);
      expect(result).toEqual({ filePath: 'path/to/file.pdf' });
    });
  });

  describe('getSignedUrlFromToken', () => {
    it('should return signed URL', async () => {
      mockFirebaseService.getSignedUrlFromParams.mockResolvedValue('signed-url');
      const result = await controller.getSignedUrlFromToken({ user: { employeeId: 'EMP001' } } as any, '2025-07');
      expect(result).toEqual({ url: 'signed-url' });
    });
  });

  describe('getSignedUrlForHR', () => {
    it('should return signed URL for HR (preview)', async () => {
      mockFirebaseService.getSignedUrlFromParams.mockResolvedValue('url-preview');
      const result = await controller.getSignedUrlForHR('EMP001', '2025-07', 'P');
      expect(result).toEqual({ url: 'url-preview' });
    });

    it('should return signed URL for HR (download)', async () => {
      mockFirebaseService.getSignedUrlFromParamsDownload.mockResolvedValue('url-download');
      const result = await controller.getSignedUrlForHR('EMP001', '2025-07', 'D');
      expect(result).toEqual({ url: 'url-download' });
    });
  });

  describe('deletePayrollAndFileByMonth', () => {
    it('should delete payroll and file', async () => {
      mockPayrollService.deleteByMonthAndEmp.mockResolvedValue('db-deleted');
      mockFirebaseService.deleteFile.mockResolvedValue('file-deleted');
      const result = await controller.deletePayrollAndFileByMonth('EMP001', '2025-07');
      expect(result).toEqual({ dbResult: 'db-deleted', fbResult: 'file-deleted' });
    });
  });
});