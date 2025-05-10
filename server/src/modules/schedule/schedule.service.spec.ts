import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { DatabaseService } from '../../database/database.service';
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a scheduled meal with converted number arrays', async () => {
      // Use any type to bypass TypeScript checks in tests
      const dto: any = {
        date: '2024-01-01',
        breakfast: ['1', '2'],
        lunch: ['3', '4'],
        dinner: ['5', '6']
      };

      const expectedDate = new Date('2024-01-01');
      
      const expectedData = {
        date: expectedDate,
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.create.mockResolvedValue(expectedData);

      const result = await service.create(dto);
      
      expect(mockDatabaseService.scheduledMeal.create).toHaveBeenCalledWith({
        data: {
          date: expect.any(Date),
          breakfast: [1, 2],
          lunch: [3, 4],
          dinner: [5, 6],
          confirmed: false
        }
      });
      
      expect(result).toEqual(expectedData);
    });

    it('should handle empty meal arrays', async () => {
      // Use any type to bypass TypeScript checks in tests
      const dto: any = {
        date: '2024-01-01',
        breakfast: [],
        lunch: [],
        dinner: []
      };

      const expectedData = {
        date: new Date('2024-01-01'),
        breakfast: [],
        lunch: [],
        dinner: [],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.create.mockResolvedValue(expectedData);

      const result = await service.create(dto);
      expect(result).toEqual(expectedData);
    });

    it('should handle missing meal arrays', async () => {
      // Use any type to bypass TypeScript checks in tests
      const dto: any = {
        date: '2024-01-01'
      };

      const expectedData = {
        date: new Date('2024-01-01'),
        breakfast: [],
        lunch: [],
        dinner: [],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.create.mockResolvedValue(expectedData);

      const result = await service.create(dto);
      expect(result).toEqual(expectedData);
    });

    it('should throw BadRequestException on create error', async () => {
      // Use any type to bypass TypeScript checks in tests
      const dto: any = {
        date: '2024-01-01',
      };

      const errorMessage = 'Database error';
      mockDatabaseService.scheduledMeal.create.mockRejectedValue(new Error(errorMessage));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should return all scheduled meals', async () => {
      const meals = [
        { 
          date: new Date('2024-01-01'), 
          breakfast: [1, 2],
          lunch: [3],
          dinner: [4, 5, 6],
          confirmed: false
        },
        { 
          date: new Date('2024-01-02'), 
          breakfast: [],
          lunch: [7, 8],
          dinner: [9],
          confirmed: true
        }
      ];

      mockDatabaseService.scheduledMeal.findMany.mockResolvedValue(meals);

      const result = await service.findAll();
      expect(result).toEqual(meals);
      expect(mockDatabaseService.scheduledMeal.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException on findMany error', async () => {
      mockDatabaseService.scheduledMeal.findMany.mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
      await expect(service.findAll()).rejects.toThrow('Failed to retrieve scheduled meals');
    });
  });

  describe('findOne', () => {
    it('should find a scheduled meal by date', async () => {
      const date = '2024-01-01';
      const formattedDate = new Date(date);
      
      const meal = {
        date: formattedDate,
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(meal);

      const result = await service.findOne(date);
      
      expect(mockDatabaseService.scheduledMeal.findUnique).toHaveBeenCalledWith({
        where: { date: expect.any(Date) }
      });
      
      expect(result).toEqual(meal);
    });

    it('should throw NotFoundException when meal not found', async () => {
      const date = '2024-01-01';
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.findOne(date)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(date)).rejects.toThrow(`Scheduled meal not found for date: ${date}`);
    });

    it('should handle database errors appropriately', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Database error';
      mockDatabaseService.scheduledMeal.findUnique.mockRejectedValue(new Error(errorMessage));

      await expect(service.findOne(date)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(date)).rejects.toThrow(errorMessage);
    });
  });

  describe('update', () => {
    it('should update a scheduled meal with converted number arrays', async () => {
      const date = '2024-01-01';
      const formattedDate = new Date(date + 'T00:00:00.000Z');
      
      const existingMeal = {
        date: formattedDate,
        breakfast: [1, 2],
        lunch: [3],
        dinner: [4],
        confirmed: false
      };
      
      // Use any type to bypass TypeScript checks in tests
      // The actual service will handle the conversion
      const updateDto: any = {
        breakfast: ['3', '4'],
        lunch: ['5', '6'],
        dinner: ['7']
      };

      const expectedUpdate = {
        ...existingMeal,
        breakfast: [3, 4],
        lunch: [5, 6],
        dinner: [7]
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue(expectedUpdate);

      const result = await service.update(date, updateDto);
      
      expect(mockDatabaseService.scheduledMeal.findUnique).toHaveBeenCalledWith({
        where: { date: formattedDate }
      });
      
      expect(mockDatabaseService.scheduledMeal.update).toHaveBeenCalledWith({
        where: { date: formattedDate },
        data: {
          breakfast: [3, 4],
          lunch: [5, 6],
          dinner: [7]
        }
      });
      
      expect(result).toEqual(expectedUpdate);
    });

    it('should update only specified meal arrays', async () => {
      const date = '2024-01-01';
      const formattedDate = new Date(date + 'T00:00:00.000Z');
      
      const existingMeal = {
        date: formattedDate,
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };
      
      // Use any type to bypass TypeScript checks in tests
      const updateDto: any = {
        lunch: ['7', '8']
      };

      const expectedUpdate = {
        ...existingMeal,
        lunch: [7, 8]
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue(expectedUpdate);

      const result = await service.update(date, updateDto);
      
      expect(mockDatabaseService.scheduledMeal.update).toHaveBeenCalledWith({
        where: { date: formattedDate },
        data: {
          breakfast: undefined,
          lunch: [7, 8],
          dinner: undefined
        }
      });
      
      expect(result).toEqual(expectedUpdate);
    });

    it('should throw NotFoundException when updating non-existent meal', async () => {
      const date = '2024-01-01';
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.update(date, {})).rejects.toThrow(NotFoundException);
      await expect(service.update(date, {})).rejects.toThrow(`Scheduled meal not found for date: ${date}`);
    });

    it('should throw BadRequestException on update error', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Database error';
      
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue({
        date: new Date(date),
        breakfast: []
      });
      
      mockDatabaseService.scheduledMeal.update.mockRejectedValue(new Error(errorMessage));

      await expect(service.update(date, {})).rejects.toThrow(BadRequestException);
      await expect(service.update(date, {})).rejects.toThrow(errorMessage);
    });
  });

  describe('confirm', () => {
    it('should confirm a scheduled meal', async () => {
      const date = '2024-01-01';
      const formattedDate = new Date(date);
      
      const existingMeal = {
        date: formattedDate,
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };

      const confirmedMeal = {
        ...existingMeal,
        confirmed: true
      };

      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(existingMeal);
      mockDatabaseService.scheduledMeal.update.mockResolvedValue(confirmedMeal);

      const result = await service.confirm(date);
      
      expect(mockDatabaseService.scheduledMeal.findUnique).toHaveBeenCalledWith({
        where: { date: formattedDate }
      });
      
      expect(mockDatabaseService.scheduledMeal.update).toHaveBeenCalledWith({
        where: { date: formattedDate },
        data: { confirmed: true }
      });
      
      expect(result.confirmed).toBe(true);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      const invalidDate = 'invalid-date';
      
      await expect(service.confirm(invalidDate)).rejects.toThrow(BadRequestException);
      await expect(service.confirm(invalidDate)).rejects.toThrow(`Invalid date format: ${invalidDate}`);
    });

    it('should throw NotFoundException when confirming non-existent meal', async () => {
      const date = '2024-01-01';
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue(null);

      await expect(service.confirm(date)).rejects.toThrow(NotFoundException);
      await expect(service.confirm(date)).rejects.toThrow(`Scheduled meal not found for date: ${date}`);
    });

    it('should handle database errors appropriately', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Database error';
      
      mockDatabaseService.scheduledMeal.findUnique.mockResolvedValue({
        date: new Date(date),
        confirmed: false
      });
      
      mockDatabaseService.scheduledMeal.update.mockRejectedValue(new Error(errorMessage));

      await expect(service.confirm(date)).rejects.toThrow(BadRequestException);
      await expect(service.confirm(date)).rejects.toThrow(errorMessage);
    });
  });

  describe('remove', () => {
    it('should remove a scheduled meal', async () => {
      const date = '2024-01-01';
      const formattedDate = new Date(date);
      
      const meal = {
        date: formattedDate,
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };

      mockDatabaseService.scheduledMeal.delete.mockResolvedValue(meal);

      const result = await service.remove(date);
      
      expect(mockDatabaseService.scheduledMeal.delete).toHaveBeenCalledWith({
        where: { date: formattedDate }
      });
      
      expect(result).toEqual(meal);
    });

    it('should throw BadRequestException on delete error', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Database error';
      mockDatabaseService.scheduledMeal.delete.mockRejectedValue(new Error(errorMessage));

      await expect(service.remove(date)).rejects.toThrow(BadRequestException);
      await expect(service.remove(date)).rejects.toThrow(errorMessage);
    });
  });
});