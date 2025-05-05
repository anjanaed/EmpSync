import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MealController', () => {
  let controller: MealController;
  let service: MealService;

  const mockMealService = {
    createWithIngredients: jest.fn(),
    findAllWithIngredients: jest.fn(),
    findOneWithIngredients: jest.fn(),
    updateWithIngredients: jest.fn(),
    remove: jest.fn(),
  };

  const mockMeal = {
    id: '1',
    nameEnglish: 'Test Meal',
    nameSinhala: 'පරික්ෂණ කෑම',
    nameTamil: 'சோதனை உணவு',
    description: 'Test Description',
    price: 9.99,
    imageUrl: 'test.jpg',
    category: ['Breakfast'],
    createdAt: new Date(),
    ingredients: [
      {
        id: 1,
        mealId: '1',
        ingredientId: 101,
        ingredient: {
          id: 101,
          name: 'Test Ingredient'
        }
      }
    ]
  };

  const mockCreateMealDto = {
    id: '1',
    nameEnglish: 'Test Meal',
    nameSinhala: 'පරික්ෂණ කෑම',
    nameTamil: 'சோதனை உணவு',
    description: 'Test Description',
    price: 9.99,
    imageUrl: 'test.jpg',
    category: ['Breakfast'],
    ingredients: [
      {
        ingredientId: 101
      }
    ]
  };

  const mockUpdateMealDto = {
    nameEnglish: 'Updated Test Meal',
    price: 10.99,
    ingredients: [
      {
        ingredientId: 101
      },
      {
        ingredientId: 102
      }
    ]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        {
          provide: MealService,
          useValue: mockMealService,
        },
      ],
    }).compile();

    controller = module.get<MealController>(MealController);
    service = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal with ingredients', async () => {
      const { ingredients, ...mealData } = mockCreateMealDto;
      mockMealService.createWithIngredients.mockResolvedValue(mockMeal);
      
      expect(await controller.create(mockCreateMealDto)).toEqual(mockMeal);
      expect(mockMealService.createWithIngredients).toHaveBeenCalledWith(
        mealData,
        ingredients
      );
    });

    it('should throw BadRequestException on error', async () => {
      mockMealService.createWithIngredients.mockRejectedValue(new Error('Error creating meal'));
      await expect(controller.create(mockCreateMealDto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return array of meals with ingredients', async () => {
      mockMealService.findAllWithIngredients.mockResolvedValue([mockMeal]);
      
      expect(await controller.findAll()).toEqual([mockMeal]);
      expect(mockMealService.findAllWithIngredients).toHaveBeenCalled();
    });

    it('should throw HttpException on error', async () => {
      mockMealService.findAllWithIngredients.mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single meal with ingredients', async () => {
      mockMealService.findOneWithIngredients.mockResolvedValue(mockMeal);
      
      expect(await controller.findOne('1')).toEqual(mockMeal);
      expect(mockMealService.findOneWithIngredients).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when meal not found', async () => {
      mockMealService.findOneWithIngredients.mockResolvedValue(null);
      await expect(controller.findOne('999')).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on error', async () => {
      mockMealService.findOneWithIngredients.mockRejectedValue(new Error('Database error'));
      await expect(controller.findOne('1')).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a meal with ingredients', async () => {
      const { ingredients, ...mealData } = mockUpdateMealDto;
      mockMealService.updateWithIngredients.mockResolvedValue(mockMeal);
      
      expect(await controller.update('1', mockUpdateMealDto)).toEqual(mockMeal);
      expect(mockMealService.updateWithIngredients).toHaveBeenCalledWith(
        '1',
        mealData,
        ingredients
      );
    });

    it('should throw HttpException on error', async () => {
      mockMealService.updateWithIngredients.mockRejectedValue(new Error('Error updating meal'));
      await expect(controller.update('1', mockUpdateMealDto)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      mockMealService.remove.mockResolvedValue(mockMeal);
      
      expect(await controller.remove('1')).toEqual(mockMeal);
      expect(mockMealService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when meal not found', async () => {
      mockMealService.remove.mockRejectedValue(new Error('Meal not found'));
      await expect(controller.remove('999')).rejects.toThrow(HttpException);
    });
  });
});