import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { MealSuggestionService } from './meal-suggestion.service';

describe('MealController', () => {
  let controller: MealController;
  let mealService: MealService;

  const mockMealService = {
    createWithIngredients: jest.fn(),
    findAllWithIngredients: jest.fn(),
    findOneWithIngredients: jest.fn(),
    updateWithIngredients: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockMealSuggestionService = {
    getMealSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        { provide: MealService, useValue: mockMealService },
        { provide: MealSuggestionService, useValue: mockMealSuggestionService },
      ],
    }).compile();

    controller = module.get<MealController>(MealController);
    mealService = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createWithIngredients', async () => {
    const dto = {
      name: 'Rice',
      ingredients: [{ ingredientId: 1 }],
    };
    mockMealService.createWithIngredients.mockResolvedValue('createdMeal');

    const result = await controller.create(dto as any, 'ORG1');
    expect(result).toBe('createdMeal');
    expect(mockMealService.createWithIngredients).toHaveBeenCalledWith(
      { name: 'Rice' },
      [{ ingredientId: 1 }],
      'ORG1',
    );
  });

  it('should return all meals', async () => {
    mockMealService.findAllWithIngredients.mockResolvedValue(['meal1', 'meal2']);
    const result = await controller.findAll('ORG1', 'false');
    expect(result).toEqual(['meal1', 'meal2']);
  });

  it('should return a specific meal', async () => {
    mockMealService.findOneWithIngredients.mockResolvedValue('meal');
    const result = await controller.findOne('1', 'ORG1');
    expect(result).toEqual('meal');
  });

  it('should call updateWithIngredients', async () => {
    mockMealService.updateWithIngredients.mockResolvedValue('updatedMeal');
    const dto = {
      name: 'New Meal',
      ingredients: [{ ingredientId: 2 }],
    };
    const result = await controller.update('1', dto as any, 'ORG1');
    expect(result).toBe('updatedMeal');
  });

  it('should call softDelete', async () => {
    mockMealService.softDelete.mockResolvedValue('softDeleted');
    const result = await controller.softDelete('1', 'ORG1');
    expect(result).toBe('softDeleted');
  });

  it('should return meal suggestions', async () => {
    mockMealSuggestionService.getMealSuggestions.mockResolvedValue(['suggestion1']);
    const result = await controller.getMealSuggestions('user1', '2025-07-26', '1', 'ORG1');
    expect(result).toEqual(['suggestion1']);
  });
});
