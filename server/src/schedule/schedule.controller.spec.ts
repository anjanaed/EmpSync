import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  const mockScheduleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a scheduled meal', async () => {
      const createDto = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs'],
        lunch: ['sandwich'],
        dinner: ['pasta']
      };

      mockScheduleService.create.mockResolvedValue(createDto);

      const result = await controller.create(createDto);
      expect(result).toEqual(createDto);
    });

    it('should throw HttpException when creation fails', async () => {
      const createDto = {
        date: new Date('2024-01-01')
      };

      mockScheduleService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all scheduled meals', async () => {
      const meals = [
        { date: new Date('2024-01-01'), breakfast: ['eggs'] },
        { date: new Date('2024-01-02'), lunch: ['sandwich'] }
      ];

      mockScheduleService.findAll.mockResolvedValue(meals);

      const result = await controller.findAll();
      expect(result).toEqual(meals);
    });

    it('should throw HttpException when retrieval fails', async () => {
      mockScheduleService.findAll.mockRejectedValue(new Error('Retrieval failed'));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should find a scheduled meal by date', async () => {
      const meal = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs']
      };

      mockScheduleService.findOne.mockResolvedValue(meal);

      const result = await controller.findOne('2024-01-01');
      expect(result).toEqual(meal);
    });

    it('should throw HttpException when meal not found', async () => {
      mockScheduleService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('2024-01-01')).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a scheduled meal', async () => {
      const updateDto = {
        breakfast: ['oatmeal']
      };
      const updatedMeal = {
        date: new Date('2024-01-01'),
        breakfast: ['oatmeal']
      };

      mockScheduleService.update.mockResolvedValue(updatedMeal);

      const result = await controller.update('2024-01-01', updateDto);
      expect(result).toEqual(updatedMeal);
    });

    it('should throw HttpException when update fails', async () => {
      mockScheduleService.update.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update('2024-01-01', {})).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should remove a scheduled meal', async () => {
      const meal = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs']
      };

      mockScheduleService.remove.mockResolvedValue(meal);

      const result = await controller.remove('2024-01-01');
      expect(result).toEqual(meal);
    });

    it('should throw HttpException when deletion fails', async () => {
      mockScheduleService.remove.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove('2024-01-01')).rejects.toThrow(HttpException);
    });
  });
});