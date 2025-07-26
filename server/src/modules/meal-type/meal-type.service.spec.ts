import { Test, TestingModule } from '@nestjs/testing';
import { MealTypeService } from './meal-type.service';
import { DatabaseService } from '../../database/database.service';
import { ScheduledMealService } from '../schedule/schedule.service';

const mockDbService = {
  mealType: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  scheduledMeal: {
    count: jest.fn(),
  },
};

const mockScheduledMealService = {
  findByDate: jest.fn(),
};

describe('MealTypeService', () => {
  let service: MealTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealTypeService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: ScheduledMealService, useValue: mockScheduledMealService },
      ],
    }).compile();

    service = module.get<MealTypeService>(MealTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll and return meal types', async () => {
    const mockResult = [{ id: 1, name: 'Lunch' }];
    mockDbService.mealType.findMany.mockResolvedValue(mockResult);
    const result = await service.findAll('org1');
    expect(mockDbService.mealType.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should call softDelete with correct logic', async () => {
    mockDbService.mealType.findFirst.mockResolvedValue({ id: 1, name: 'Lunch' });
    mockDbService.scheduledMeal.count.mockResolvedValue(2);
    mockDbService.mealType.update.mockResolvedValue({ id: 1, isDeleted: true });

    const result = await service.softDelete(1, 'org1');
    expect(mockDbService.mealType.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isDeleted: true },
    });
    expect(result).toHaveProperty('success', true);
  });
});
