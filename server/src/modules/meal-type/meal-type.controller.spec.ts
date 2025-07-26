import { Test, TestingModule } from '@nestjs/testing';
import { MealTypeController } from './meal-type.controller';
import { MealTypeService } from './meal-type.service';

const mockMealTypeService = {
  findAllIncludingDeleted: jest.fn(),
  findDeleted: jest.fn(),
  findDefaults: jest.fn(),
  findTodayAndTomorrow: jest.fn(),
  findByDateOrDefault: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  toggleIsDefault: jest.fn(),
  patchTimeElement: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('MealTypeController', () => {
  let controller: MealTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealTypeController],
      providers: [{ provide: MealTypeService, useValue: mockMealTypeService }],
    }).compile();

    controller = module.get<MealTypeController>(MealTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllIncludingDeleted with params', async () => {
    mockMealTypeService.findAllIncludingDeleted.mockResolvedValue([]);
    await controller.findAll('org1', false);
    expect(mockMealTypeService.findAllIncludingDeleted).toHaveBeenCalledWith('org1', false);
  });

  it('should call create with correct parameters', async () => {
    const dto = { name: 'Lunch', time: '12:00', isDefault: true, date: '2025-07-26' };
    mockMealTypeService.create.mockResolvedValue(dto);
    const result = await controller.create(dto, 'org1');
    expect(mockMealTypeService.create).toHaveBeenCalledWith('Lunch', '12:00', true, '2025-07-26', 'org1');
    expect(result).toEqual(dto);
  });
});