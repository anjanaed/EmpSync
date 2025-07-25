import { Test, TestingModule } from '@nestjs/testing';
import { PayeTaxController } from './paye-tax.controller';
import { PayeTaxService } from './paye-tax.service';
import { HttpException } from '@nestjs/common';

describe('PayeTaxController', () => {
  let controller: PayeTaxController;
  let service: PayeTaxService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayeTaxController],
      providers: [
        {
          provide: PayeTaxService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PayeTaxController>(PayeTaxController);
    service = module.get<PayeTaxService>(PayeTaxService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a PAYE tax slab', async () => {
      const dto = { orgId: 'org1', rate: 15, from: 1000, to: 5000 };
      mockService.create.mockResolvedValue(dto);

      const result = await controller.create(dto as any);
      expect(result).toEqual(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw error if service fails', async () => {
      mockService.create.mockRejectedValue(new Error('Create failed'));
      await expect(controller.create({} as any)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all tax slabs for an org', async () => {
      const result = [{ id: 1 }];
      mockService.findAll.mockResolvedValue(result);
      expect(await controller.findAll('org1')).toEqual(result);
    });

    it('should throw error if findAll fails', async () => {
      mockService.findAll.mockRejectedValue(new Error('FindAll failed'));
      await expect(controller.findAll('org1')).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a tax slab by ID', async () => {
      const tax = { id: 1 };
      mockService.findOne.mockResolvedValue(tax);
      expect(await controller.findOne(1)).toEqual(tax);
    });

    it('should throw not found if null returned', async () => {
      mockService.findOne.mockResolvedValue(null);
      await expect(controller.findOne(999)).rejects.toThrow(HttpException);
    });

    it('should throw error if findOne fails', async () => {
      mockService.findOne.mockRejectedValue(new Error('DB error'));
      await expect(controller.findOne(2)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update PAYE slabs', async () => {
      const dto = [{ orgId: 'org1', rate: 20 }];
      mockService.update.mockResolvedValue(dto);
      expect(await controller.update(dto as any)).toEqual(dto);
    });

    it('should throw error if update fails', async () => {
      mockService.update.mockRejectedValue(new Error('Update failed'));
      await expect(controller.update([])).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete a slab by ID', async () => {
      const id = '123';
      const result = { id };
      mockService.remove.mockResolvedValue(result);
      expect(await controller.remove(id)).toEqual(result);
    });

    it('should throw error if remove fails', async () => {
      mockService.remove.mockRejectedValue(new Error('Remove failed'));
      await expect(controller.remove('bad-id')).rejects.toThrow(HttpException);
    });
  });
});
