import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMealService } from './schedule.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ScheduledMealService', () => {
  let service: ScheduledMealService;
  let db: any;

  const mockDatabaseService = {
    scheduledMeal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockDatabaseService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMealService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ScheduledMealService>(ScheduledMealService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a scheduled meal', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue(null);
    mockDatabaseService.scheduledMeal.create.mockResolvedValue('createdMeal');

    const result = await service.create('2025-07-26', 1, [1, 2], 'ORG1');
    expect(result).toBe('createdMeal');
  });

  it('should throw if schedule already exists on create', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue({ id: 1 });

    await expect(
      service.create('2025-07-26', 1, [1], 'ORG1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return all schedules', async () => {
    mockDatabaseService.scheduledMeal.findMany.mockResolvedValue(['a', 'b']);
    const result = await service.findAll('ORG1');
    expect(result).toEqual(['a', 'b']);
  });

  it('should return schedules by date', async () => {
    mockDatabaseService.scheduledMeal.findMany.mockResolvedValue(['byDate']);
    const result = await service.findByDate('2025-07-26', 'ORG1');
    expect(result).toEqual(['byDate']);
  });

  it('should update a scheduled meal', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue({ id: 1 });
    mockDatabaseService.scheduledMeal.update.mockResolvedValue('updated');

    const result = await service.update(
      1,
      { mealTypeId: 2 },
      [3],
      'ORG1',
    );
    expect(result).toBe('updated');
  });

  it('should throw if scheduled meal not found on update', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue(null);
    await expect(
      service.update(1, { mealTypeId: 2 }, [], 'ORG1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a scheduled meal', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue({ id: 1 });
    mockDatabaseService.scheduledMeal.delete.mockResolvedValue('deleted');
    const result = await service.remove(1, 'ORG1');
    expect(result).toBe('deleted');
  });

  it('should throw if scheduled meal not found on delete', async () => {
    mockDatabaseService.scheduledMeal.findFirst.mockResolvedValue(null);
    await expect(service.remove(1, 'ORG1')).rejects.toThrow(NotFoundException);
  });
});
