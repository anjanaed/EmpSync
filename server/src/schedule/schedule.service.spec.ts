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
    it('should create a scheduled meal with converted number arrays', async () => {
      const dto = {
        date: new Date('2024-01-01'),
        breakfast: ['1', '2'],
        lunch: ['3', '4'],
        dinner: ['5', '6']
      };

      const expectedData = {
        date: new Date('2024-01-01'),
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.create.mockResolvedValue(expectedData);

      const result = await service.create(dto);
      expect(result).toEqual(expectedData);
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
    it('should update a scheduled meal with converted number arrays', async () => {
      const existingMeal = {
        date: new Date('2024-01-01'),
        breakfast: [1, 2]
      };
      const updateDto = {
        breakfast: ['3', '4'],
        lunch: ['5', '6']
      };

      const expectedUpdate = {
        ...existingMeal,
        breakfast: [3, 4],
        lunch: [5, 6]
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue(expectedUpdate);

      const result = await service.update('2024-01-01', updateDto);
      expect(result).toEqual(expectedUpdate);
    });

    it('should throw NotFoundException when updating non-existent meal', async () => {
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.update('2024-01-01', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('should confirm a scheduled meal', async () => {
      const existingMeal = {
        date: new Date('2024-01-01'),
        confirmed: false
      };

      const confirmedMeal = {
        ...existingMeal,
        confirmed: true
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue(confirmedMeal);

      const result = await service.confirm('2024-01-01');
      expect(result.confirmed).toBe(true);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      await expect(service.confirm('invalid-date')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when confirming non-existent meal', async () => {
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.confirm('2024-01-01')).rejects.toThrow(NotFoundException);
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