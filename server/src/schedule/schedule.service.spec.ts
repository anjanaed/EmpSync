import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    scheduledMeal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a scheduled meal', async () => {
      const dto = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs'],
        lunch: ['sandwich'],
        dinner: ['pasta']
      };

      mockDatabaseService.scheduledMeal.create.mockResolvedValue(dto);

      const result = await service.create(dto);
      expect(result).toEqual(dto);
    });

    it('should throw BadRequestException on create error', async () => {
      const dto = {
        date: new Date('2024-01-01'),
      };

      mockDatabaseService.scheduledMeal.create.mockRejectedValue(new Error());

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all scheduled meals', async () => {
      const meals = [
        { date: new Date('2024-01-01'), breakfast: ['eggs'] },
        { date: new Date('2024-01-02'), lunch: ['sandwich'] }
      ];

      mockDatabaseService.scheduledMeal.findMany.mockResolvedValue(meals);

      const result = await service.findAll();
      expect(result).toEqual(meals);
    });
  });

  describe('findOne', () => {
    it('should find a scheduled meal by date', async () => {
      const meal = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs']
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(meal);

      const result = await service.findOne('2024-01-01');
      expect(result).toEqual(meal);
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.findOne('2024-01-01')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a scheduled meal', async () => {
      const existingMeal = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs']
      };
      const updateDto = {
        breakfast: ['oatmeal']
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue({...existingMeal, ...updateDto});

      const result = await service.update('2024-01-01', updateDto);
      expect(result.breakfast).toEqual(['oatmeal']);
    });
  });

  describe('remove', () => {
    it('should remove a scheduled meal', async () => {
      const meal = {
        date: new Date('2024-01-01'),
        breakfast: ['eggs']
      };

      mockDatabaseService.scheduledMeal.delete.mockResolvedValue(meal);

      const result = await service.remove('2024-01-01');
      expect(result).toEqual(meal);
    });

    it('should throw BadRequestException on delete error', async () => {
      mockDatabaseService.scheduledMeal.delete.mockRejectedValue(new Error());

      await expect(service.remove('2024-01-01')).rejects.toThrow(BadRequestException);
    });
  });
});
