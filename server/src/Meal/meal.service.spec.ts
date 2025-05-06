import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MealService', () => {
  let service: MealService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    meal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mealIngredient: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockDatabaseService)),
  };

  const mockMeal = {
    id: 1,
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
        mealId: 1,
        ingredientId: 101,
        ingredient: {
          id: 101,
          name: 'Test Ingredient'
        }
      }
    ]
  };

  const mockMealData = {
    nameEnglish: 'Test Meal',
    nameSinhala: 'පරික්ෂණ කෑම',
    nameTamil: 'சோதனை உணவு',
    description: 'Test Description',
    price: 9.99,
    imageUrl: 'test.jpg',
    category: ['Breakfast'],
  };

  const mockIngredients = [
    { ingredientId: 101 },
    { ingredientId: 102 }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<MealService>(MealService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWithIngredients', () => {
    it('should create a meal with ingredients', async () => {
      mockDatabaseService.meal.create.mockResolvedValue(mockMeal);
      
      const result = await service.createWithIngredients(mockMealData, mockIngredients);
      
      expect(result).toEqual(mockMeal);
      expect(mockDatabaseService.meal.create).toHaveBeenCalledWith({
        data: {
          ...mockMealData,
          ingredients: {
            create: mockIngredients.map(ing => ({
              ingredient: {
                connect: { id: ing.ingredientId }
              }
            }))
          }
        },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    it('should throw BadRequestException on create error', async () => {
      mockDatabaseService.meal.create.mockRejectedValue(new Error('Error creating meal'));
      
      await expect(service.createWithIngredients(mockMealData, mockIngredients))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException as deprecated', async () => {
      await expect(service.create(mockMealData)).rejects.toThrow(BadRequestException);
      expect(mockDatabaseService.meal.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllWithIngredients', () => {
    it('should return all meals with ingredients', async () => {
      const meals = [mockMeal];
      mockDatabaseService.meal.findMany.mockResolvedValue(meals);
      
      const result = await service.findAllWithIngredients();
      
      expect(result).toEqual(meals);
      expect(mockDatabaseService.meal.findMany).toHaveBeenCalledWith({
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    it('should throw BadRequestException on error', async () => {
      mockDatabaseService.meal.findMany.mockRejectedValue(new Error('Database error'));
      
      await expect(service.findAllWithIngredients()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all meals without ingredients', async () => {
      const meals = [mockMealData];
      mockDatabaseService.meal.findMany.mockResolvedValue(meals);
      
      const result = await service.findAll();
      
      expect(result).toEqual(meals);
      expect(mockDatabaseService.meal.findMany).toHaveBeenCalledWith({});
    });
  });

  describe('findOneWithIngredients', () => {
    it('should return a meal with ingredients by id', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMeal);
      
      const result = await service.findOneWithIngredients(1);
      
      expect(result).toEqual(mockMeal);
      expect(mockDatabaseService.meal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(null);
      
      await expect(service.findOneWithIngredients(999)).rejects.toThrow(NotFoundException);
    });

    it('should pass through NotFoundException', async () => {
      mockDatabaseService.meal.findUnique.mockRejectedValue(new NotFoundException('Meal not found'));
      
      await expect(service.findOneWithIngredients(1)).rejects.toThrow(NotFoundException);
    });

    it('should convert other errors to BadRequestException', async () => {
      mockDatabaseService.meal.findUnique.mockRejectedValue(new Error('Database error'));
      
      await expect(service.findOneWithIngredients(1)).rejects.toThrow(BadRequestException);
    });
  });

  // Remove the findOne test since the method doesn't exist in the implementation
  
  describe('updateWithIngredients', () => {
    const updateData = {
      nameEnglish: 'Updated Meal',
      price: 12.99
    };

    it('should update a meal with ingredients', async () => {
      mockDatabaseService.meal.update.mockResolvedValue(mockMeal);
      
      const result = await service.updateWithIngredients(1, updateData, mockIngredients);
      
      expect(result).toEqual(mockMeal);
      expect(mockDatabaseService.$transaction).toHaveBeenCalled();
      expect(mockDatabaseService.mealIngredient.deleteMany).toHaveBeenCalledWith({
        where: { mealId: 1 }
      });
      expect(mockDatabaseService.mealIngredient.create).toHaveBeenCalledTimes(mockIngredients.length);
      expect(mockDatabaseService.meal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    it('should update a meal without ingredients if not provided', async () => {
      mockDatabaseService.meal.update.mockResolvedValue(mockMeal);
      
      const result = await service.updateWithIngredients(1, updateData);
      
      expect(result).toEqual(mockMeal);
      expect(mockDatabaseService.mealIngredient.deleteMany).not.toHaveBeenCalled();
      expect(mockDatabaseService.mealIngredient.create).not.toHaveBeenCalled();
      expect(mockDatabaseService.meal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    it('should throw BadRequestException on update error', async () => {
      mockDatabaseService.$transaction.mockRejectedValue(new Error('Error updating meal'));
      
      await expect(service.updateWithIngredients(1, updateData, mockIngredients))
        .rejects.toThrow(BadRequestException);
    });
  });

  // Remove the update test since the method doesn't exist in the implementation

  describe('remove', () => {
    it('should remove a meal after checking it exists', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMealData);
      mockDatabaseService.meal.delete.mockResolvedValue(mockMealData);
      
      const result = await service.remove(1);
      
      expect(result).toEqual(mockMealData);
      expect(mockDatabaseService.meal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockDatabaseService.meal.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(null);
      
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.meal.delete).not.toHaveBeenCalled();
    });

    it('should pass through NotFoundException', async () => {
      mockDatabaseService.meal.findUnique.mockRejectedValue(new NotFoundException('Meal not found'));
      
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should convert other errors to BadRequestException', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMealData);
      mockDatabaseService.meal.delete.mockRejectedValue(new Error('Database error'));
      
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});