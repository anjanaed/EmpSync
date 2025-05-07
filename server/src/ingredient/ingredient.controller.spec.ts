import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IngredientsController } from './ingredient.controller';
import { IngredientsService } from './ingredient.service';
import { Prisma } from '@prisma/client';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const mockIngredientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getIngredientStats: jest.fn(),
    getAdvancedIngredientStats: jest.fn(),
    getMonthlyIngredientStats: jest.fn(),
    getOptimizedIngredients: jest.fn(),
    createBudgetBasedOrder: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockIngredientsService,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
    service = module.get<IngredientsService>(IngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a single ingredient', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1,
        type: 'SWEETENER'
      };

      mockIngredientsService.create.mockResolvedValue(dto);
      const result = await controller.create(dto);

      expect(result).toBe(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should create multiple ingredients', async () => {
      const dtos: Prisma.IngredientCreateInput[] = [
        {
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1,
          type: 'SWEETENER'
        },
        {
          name: 'Salt',
          price_per_unit: 1.5,
          quantity: 150,
          priority: 2,
          type: 'SEASONING'
        }
      ];

      mockIngredientsService.create.mockResolvedValue(dtos);
      const result = await controller.create(dtos);

      expect(result).toBe(dtos);
      expect(service.create).toHaveBeenCalledWith(dtos);
    });
  });

  describe('findAll', () => {
    it('should return an array of ingredients', async () => {
      const mockIngredients = [
        {
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1
        }
      ];

      mockIngredientsService.findAll.mockResolvedValue(mockIngredients);
      const result = await controller.findAll();

      expect(result).toBe(mockIngredients);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getIngredientStats', () => {
    it('should return ingredient statistics', async () => {
      const mockStats = {
        totalCount: 10,
        priorityCount: { '1': 3, '2': 4, '3': 3 },
        lastUpdated: new Date()
      };

      mockIngredientsService.getIngredientStats.mockResolvedValue(mockStats);
      const result = await controller.getIngredientStats();

      expect(result).toBe(mockStats);
      expect(service.getIngredientStats).toHaveBeenCalled();
    });
  });

  describe('getAdvancedIngredientStats', () => {
    it('should return advanced ingredient statistics', async () => {
      const mockStats = {
        statistics: { '1': { types: {} } },
        totalIngredients: 10,
        lastUpdated: new Date()
      };

      mockIngredientsService.getAdvancedIngredientStats.mockResolvedValue(mockStats);
      const result = await controller.getAdvancedIngredientStats();

      expect(result).toBe(mockStats);
      expect(service.getAdvancedIngredientStats).toHaveBeenCalled();
    });
  });

  describe('getMonthlyStats', () => {
    it('should return monthly stats without year parameter', async () => {
      const mockStats = {
        year: new Date().getFullYear(),
        monthlyStatistics: [],
        summary: {}
      };

      mockIngredientsService.getMonthlyIngredientStats.mockResolvedValue(mockStats);
      const result = await controller.getMonthlyStats();

      expect(result).toBe(mockStats);
      expect(service.getMonthlyIngredientStats).toHaveBeenCalledWith(undefined);
    });

    it('should return monthly stats for specific year', async () => {
      const year = '2024';
      const mockStats = {
        year: 2024,
        monthlyStatistics: [],
        summary: {}
      };

      mockIngredientsService.getMonthlyIngredientStats.mockResolvedValue(mockStats);
      const result = await controller.getMonthlyStats(year);

      expect(result).toBe(mockStats);
      expect(service.getMonthlyIngredientStats).toHaveBeenCalledWith(2024);
    });
  });

  describe('getOptimizedIngredients', () => {
    it('should return optimized ingredients', async () => {
      const mockOptimized = {
        ingredients: [],
        optimization: {
          totalSavings: 1000,
          suggestedChanges: 5
        }
      };

      mockIngredientsService.getOptimizedIngredients.mockResolvedValue(mockOptimized);
      const result = await controller.getOptimizedIngredients();

      expect(result).toBe(mockOptimized);
      expect(service.getOptimizedIngredients).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ingredient', async () => {
      const mockIngredient = {
        id: 1,
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };

      mockIngredientsService.findOne.mockResolvedValue(mockIngredient);
      const result = await controller.findOne(1);

      expect(result).toBe(mockIngredient);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updateDto: Prisma.IngredientUpdateInput = {
        name: 'Brown Sugar',
        price_per_unit: 3.0
      };
      const mockUpdated = {
        id: 1,
        ...updateDto
      };

      mockIngredientsService.update.mockResolvedValue(mockUpdated);
      const result = await controller.update(1, updateDto);

      expect(result).toBe(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      const mockRemoved = {
        id: 1,
        name: 'Sugar'
      };

      mockIngredientsService.remove.mockResolvedValue(mockRemoved);
      const result = await controller.remove(1);

      expect(result).toBe(mockRemoved);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('createBudgetBasedOrder', () => {
    it('should create an order based on valid budget', async () => {
      const mockBudget = 1000;
      const mockResponse = {
        id: '1',
        budget: mockBudget,
        items: [
          { id: '1', name: 'Sugar', quantity: 10, cost: 250 },
          { id: '2', name: 'Salt', quantity: 15, cost: 150 }
        ],
        totalCost: 400,
        createdAt: new Date()
      };

      mockIngredientsService.createBudgetBasedOrder.mockResolvedValue(mockResponse);
      const result = await controller.createBudgetBasedOrder({ budget: mockBudget });

      expect(result).toBe(mockResponse);
      expect(service.createBudgetBasedOrder).toHaveBeenCalledWith(mockBudget);
    });

    it('should handle zero budget', async () => {
      const mockError = new HttpException('Budget must be greater than zero', HttpStatus.BAD_REQUEST);
      
      mockIngredientsService.createBudgetBasedOrder.mockRejectedValue(mockError);
      
      await expect(controller.createBudgetBasedOrder({ budget: 0 }))
        .rejects
        .toThrow(mockError);
    });

    it('should handle negative budget', async () => {
      const mockError = new HttpException('Budget must be greater than zero', HttpStatus.BAD_REQUEST);
      
      mockIngredientsService.createBudgetBasedOrder.mockRejectedValue(mockError);
      
      await expect(controller.createBudgetBasedOrder({ budget: -100 }))
        .rejects
        .toThrow(mockError);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service unavailable');
      
      mockIngredientsService.createBudgetBasedOrder.mockRejectedValue(mockError);
      
      await expect(controller.createBudgetBasedOrder({ budget: 1000 }))
        .rejects
        .toThrow(mockError);
    });
  });
});