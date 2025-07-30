import { Test, TestingModule } from '@nestjs/testing';
import { IndiAdjustmentController } from './in-adjustment.controller';
import { IndiAdjustmentService } from './in-adjustment.service';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock the service methods
const mockIndiAdjustmentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('IndiAdjustmentController', () => {
  let controller: IndiAdjustmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndiAdjustmentController],
      providers: [
        {
          provide: IndiAdjustmentService,
          useValue: mockIndiAdjustmentService,
        },
      ],
    }).compile();

    controller = module.get<IndiAdjustmentController>(IndiAdjustmentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create an adjustment successfully', async () => {
      const dto = { amount: 1000, reason: 'Bonus', employee: { connect: { empNo: 'A001' } } };
      mockIndiAdjustmentService.create.mockResolvedValue(dto);

      const result = await controller.create(dto as any);
      expect(result).toEqual(dto);
      expect(mockIndiAdjustmentService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BAD_REQUEST if service throws error', async () => {
      mockIndiAdjustmentService.create.mockRejectedValue(new Error('Create failed'));
      await expect(controller.create({} as any)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll()', () => {
    it('should return all adjustments', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      mockIndiAdjustmentService.findAll.mockResolvedValue(data);
      const result = await controller.findAll('', '');
      expect(result).toEqual(data);
    });
  });

  describe('findOne()', () => {
    it('should return one adjustment', async () => {
      const data = { id: 1 };
      mockIndiAdjustmentService.findOne.mockResolvedValue(data);
      const result = await controller.findOne(1);
      expect(result).toEqual(data);
    });

    it('should throw 404 if not found', async () => {
      mockIndiAdjustmentService.findOne.mockResolvedValue(null);
      await expect(controller.findOne(99)).rejects.toThrow('Adjustment not found');
    });
  });

  describe('update()', () => {
    it('should update an adjustment', async () => {
      const dto = { amount: 2000 };
      const updated = { id: 1, amount: 2000 };
      mockIndiAdjustmentService.update.mockResolvedValue(updated);
      const result = await controller.update(1, dto as any);
      expect(result).toEqual(updated);
    });
  });

  describe('remove()', () => {
    it('should remove an adjustment', async () => {
      const deleted = { id: 1 };
      mockIndiAdjustmentService.remove.mockResolvedValue(deleted);
      const result = await controller.remove('1');
      expect(result).toEqual(deleted);
    });
  });
});
