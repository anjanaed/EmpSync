import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMealController } from './schedule.controller';
import { ScheduledMealService } from './schedule.service';

describe('ScheduledMealController', () => {
  let controller: ScheduledMealController;
  let service: ScheduledMealService;

  const mockService = {
    create: jest.fn(),
    findByDate: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledMealController],
      providers: [
        {
          provide: ScheduledMealService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ScheduledMealController>(ScheduledMealController);
    service = module.get<ScheduledMealService>(ScheduledMealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct parameters', async () => {
    const dto = {
      date: '2025-07-26',
      mealTypeId: 1,
      mealIds: [1, 2],
    };
    mockService.create.mockResolvedValue('createdSchedule');
    const result = await controller.create(dto, 'ORG1');
    expect(result).toBe('createdSchedule');
    expect(mockService.create).toHaveBeenCalledWith(
      dto.date,
      dto.mealTypeId,
      dto.mealIds,
      'ORG1',
    );
  });

  it('should return scheduled meals for given date', async () => {
    mockService.findByDate.mockResolvedValue(['meal1']);
    const result = await controller.findByDate('2025-07-26', 'ORG1');
    expect(result).toEqual(['meal1']);
  });

  it('should return all scheduled meals', async () => {
    mockService.findAll.mockResolvedValue(['mealA', 'mealB']);
    const result = await controller.findAll('ORG1');
    expect(result).toEqual(['mealA', 'mealB']);
  });

  it('should update a scheduled meal', async () => {
    const updateDto = { mealTypeId: 2, mealIds: [3, 4] };
    mockService.update.mockResolvedValue('updatedMeal');
    const result = await controller.update(1, updateDto, 'ORG1');
    expect(result).toBe('updatedMeal');
  });

  it('should remove a scheduled meal', async () => {
    mockService.remove.mockResolvedValue('deleted');
    const result = await controller.remove(1, 'ORG1');
    expect(result).toBe('deleted');
  });
});
