import { Test, TestingModule } from '@nestjs/testing';
import { PayeTaxService } from './paye-tax.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PayeTaxService', () => {
  let service: PayeTaxService;
  let db: {
    payeTaxSlab: {
      create: jest.Mock;
      createMany: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    db = {
      payeTaxSlab: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayeTaxService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<PayeTaxService>(PayeTaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tax slab', async () => {
      const dto = { orgId: 'org123', lowerLimit: 0, upperLimit: 100000, rate: 5, deduction: 0 };
      db.payeTaxSlab.createMany.mockResolvedValue({ count: 1 });

      const result = await service.create(dto as any);
      expect(result).toEqual({ count: 1 });
      expect(db.payeTaxSlab.createMany).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw BadRequestException on error', async () => {
      db.payeTaxSlab.createMany.mockRejectedValue(new Error('DB error'));

      await expect(service.create({} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all tax slabs', async () => {
      const fakeData = [{ id: 1 }, { id: 2 }];
      db.payeTaxSlab.findMany.mockResolvedValue(fakeData);

      const result = await service.findAll();
      expect(result).toEqual(fakeData);
    });

    it('should return filtered tax slabs by orgId', async () => {
      const orgId = 'org001';
      db.payeTaxSlab.findMany.mockResolvedValue([{ id: 1, orgId }]);

      const result = await service.findAll(orgId);
      expect(db.payeTaxSlab.findMany).toHaveBeenCalledWith({ where: { orgId } });
      expect(result[0].orgId).toBe(orgId);
    });
  });

  describe('findOne', () => {
    it('should return one tax slab', async () => {
      db.payeTaxSlab.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if not found', async () => {
      db.payeTaxSlab.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on DB error', async () => {
      db.payeTaxSlab.findUnique.mockRejectedValue(new Error('fail'));

      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should delete all and recreate tax slabs', async () => {
      const dto = [{ lowerLimit: 0, upperLimit: 50000, rate: 5, deduction: 0, orgId: 'org1' }];
      db.payeTaxSlab.createMany.mockResolvedValue({ count: 1 });

      const result = await service.update(dto as any);
      expect(db.payeTaxSlab.deleteMany).toHaveBeenCalled();
      expect(db.payeTaxSlab.createMany).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ count: 1 });
    });

    it('should throw BadRequestException on error', async () => {
      db.payeTaxSlab.createMany.mockRejectedValue(new Error('fail'));

      await expect(service.update([])).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a tax slab by id', async () => {
      db.payeTaxSlab.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove('1');
      expect(db.payeTaxSlab.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });

    it('should throw BadRequestException on delete error', async () => {
      db.payeTaxSlab.delete.mockRejectedValue(new Error('fail'));

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
