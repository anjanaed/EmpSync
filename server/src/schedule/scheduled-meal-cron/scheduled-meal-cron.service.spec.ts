import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMealCronService } from './scheduled-meal-cron.service';
import { DatabaseService } from '../../database/database.service';
import { Logger } from '@nestjs/common';

describe('ScheduledMealCronService', () => {
  let service: ScheduledMealCronService;
  let prisma: { scheduledMeal: { updateMany: jest.Mock } };
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = {
      scheduledMeal: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMealCronService,
        { provide: DatabaseService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ScheduledMealCronService>(ScheduledMealCronService);

    // Spy on logger methods
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should confirm scheduled meals successfully', async () => {
    // Mock updateMany to return a fake result
    prisma.scheduledMeal.updateMany.mockResolvedValue({ count: 3 });

    await service.confirmScheduledMeals();

    expect(prisma.scheduledMeal.updateMany).toHaveBeenCalledTimes(1);
    expect(loggerLogSpy).toHaveBeenCalledWith('Running scheduled meal confirmation...');
    expect(loggerLogSpy).toHaveBeenCalledWith('Confirmed 3 scheduled meals.');
  });

  it('should log error if something goes wrong', async () => {
    const error = new Error('Something went wrong');
    prisma.scheduledMeal.updateMany.mockRejectedValue(error);

    await service.confirmScheduledMeals();

    expect(loggerErrorSpy).toHaveBeenCalled();
    expect(loggerErrorSpy.mock.calls[0][0]).toEqual('Error confirming scheduled meals');
    expect(loggerErrorSpy.mock.calls[0][1]).toBeDefined();
  });
});
