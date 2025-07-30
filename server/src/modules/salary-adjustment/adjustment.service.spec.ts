import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentService } from './adjustment.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdjustmentService', () => {
  let service: AdjustmentService;
  let mockDb: {
    salaryAdjustments: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockDb = {
      salaryAdjustments: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustmentService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<AdjustmentService>(AdjustmentService);
  });

  it('should create a salary adjustment', async () => {
    const dto = { amount: 1000, orgId: 'org1', employee: { connect: { empNo: 'E001' } } };
    const created = { id: 1, ...dto };
    mockDb.salaryAdjustments.create.mockResolvedValue(created);

    const result = await service.create(dto as any);
    expect(result).toEqual(created);
    expect(mockDb.salaryAdjustments.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should throw BadRequestException on create failure', async () => {
    mockDb.salaryAdjustments.create.mockRejectedValue(new Error('DB Error'));
    await expect(service.create({} as any)).rejects.toThrow(BadRequestException);
  });

  it('should find all adjustments (no orgId)', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    mockDb.salaryAdjustments.findMany.mockResolvedValue(data);

    const result = await service.findAll();
    expect(result).toEqual(data);
    expect(mockDb.salaryAdjustments.findMany).toHaveBeenCalledWith({ where: undefined });
  });

  it('should find all adjustments with orgId', async () => {
    const data = [{ id: 3 }];
    mockDb.salaryAdjustments.findMany.mockResolvedValue(data);

    const result = await service.findAll('org1');
    expect(result).toEqual(data);
    expect(mockDb.salaryAdjustments.findMany).toHaveBeenCalledWith({ where: { orgId: 'org1' } });
  });

  it('should throw BadRequestException on findAll failure', async () => {
    mockDb.salaryAdjustments.findMany.mockRejectedValue(new Error('Fail'));
    await expect(service.findAll()).rejects.toThrow(BadRequestException);
  });

  it('should find one adjustment', async () => {
    const adjustment = { id: 1 };
    mockDb.salaryAdjustments.findUnique.mockResolvedValue(adjustment);

    const result = await service.findOne(1);
    expect(result).toEqual(adjustment);
  });

  it('should throw NotFoundException if adjustment not found', async () => {
    mockDb.salaryAdjustments.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException on findOne failure', async () => {
    mockDb.salaryAdjustments.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(service.findOne(5)).rejects.toThrow(BadRequestException);
  });

  it('should update an adjustment', async () => {
    const dto = { amount: 1500 };
    const updated = { id: 1, ...dto };
    mockDb.salaryAdjustments.update.mockResolvedValue(updated);

    const result = await service.update('1', dto as any);
    expect(result).toEqual(updated);
    expect(mockDb.salaryAdjustments.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('should throw BadRequestException on update failure', async () => {
    mockDb.salaryAdjustments.update.mockRejectedValue(new Error('Update failed'));
    await expect(service.update('1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('should delete an adjustment', async () => {
    const deleted = { id: 1 };
    mockDb.salaryAdjustments.delete.mockResolvedValue(deleted);

    const result = await service.remove('1');
    expect(result).toEqual(deleted);
    expect(mockDb.salaryAdjustments.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw BadRequestException on delete failure', async () => {
    mockDb.salaryAdjustments.delete.mockRejectedValue(new Error('Delete error'));
    await expect(service.remove('2')).rejects.toThrow(BadRequestException);
  });
});
