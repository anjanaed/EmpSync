import { Test, TestingModule } from '@nestjs/testing';
import { AdjustmentController } from './adjustment.controller';
import { AdjustmentService } from './adjustment.service';
import { Prisma } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('AdjustmentController', () => {
  let controller: AdjustmentController;
  let service: AdjustmentService;

  const mockAdjustment = { id: 1, label: 'Test Adjustment', amount: 1000 };
  const mockDtoCreate: Prisma.SalaryAdjustmentsCreateInput = {
    label: 'Test Adjustment',
    amount: 1000,
    orgId: 'org1',
  } as any;
  const mockDtoUpdate: Prisma.SalaryAdjustmentsUpdateInput = {
    amount: 1500,
  } as any;

  const adjustmentServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdjustmentController],
      providers: [
        {
          provide: AdjustmentService,
          useValue: adjustmentServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdjustmentController>(AdjustmentController);
    service = module.get<AdjustmentService>(AdjustmentService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an adjustment', async () => {
      adjustmentServiceMock.create.mockResolvedValue(mockAdjustment);

      const result = await controller.create(mockDtoCreate);

      expect(result).toEqual(mockAdjustment);
      expect(adjustmentServiceMock.create).toHaveBeenCalledWith(mockDtoCreate);
    });

    it('should throw HttpException on service failure', async () => {
      adjustmentServiceMock.create.mockRejectedValue(new Error('fail'));

      await expect(controller.create(mockDtoCreate)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return list of adjustments', async () => {
      adjustmentServiceMock.findAll.mockResolvedValue([mockAdjustment]);

      const result = await controller.findAll('org1');

      expect(result).toEqual([mockAdjustment]);
      expect(adjustmentServiceMock.findAll).toHaveBeenCalledWith('org1');
    });

    it('should throw HttpException on service failure', async () => {
      adjustmentServiceMock.findAll.mockRejectedValue(new Error('fail'));

      await expect(controller.findAll('org1')).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single adjustment', async () => {
      adjustmentServiceMock.findOne.mockResolvedValue(mockAdjustment);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockAdjustment);
      expect(adjustmentServiceMock.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException if adjustment not found', async () => {
      adjustmentServiceMock.findOne.mockResolvedValue(null);

      await expect(controller.findOne(99)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on service failure', async () => {
      adjustmentServiceMock.findOne.mockRejectedValue(new Error('fail'));

      await expect(controller.findOne(1)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update adjustment', async () => {
      adjustmentServiceMock.update.mockResolvedValue(mockAdjustment);

      const result = await controller.update('1', mockDtoUpdate);

      expect(result).toEqual(mockAdjustment);
      expect(adjustmentServiceMock.update).toHaveBeenCalledWith('1', mockDtoUpdate);
    });

    it('should throw HttpException on service failure', async () => {
      adjustmentServiceMock.update.mockRejectedValue(new Error('fail'));

      await expect(controller.update('1', mockDtoUpdate)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should remove adjustment', async () => {
      adjustmentServiceMock.remove.mockResolvedValue(mockAdjustment);

      const result = await controller.remove('1');

      expect(result).toEqual(mockAdjustment);
      expect(adjustmentServiceMock.remove).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException on service failure', async () => {
      adjustmentServiceMock.remove.mockRejectedValue(new Error('fail'));

      await expect(controller.remove('1')).rejects.toThrow(HttpException);
    });
  });
});
