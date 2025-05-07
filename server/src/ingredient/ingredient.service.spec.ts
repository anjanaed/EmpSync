import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IngredientsService } from './ingredient.service';
import { DatabaseService } from '../database/database.service';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    ingredient: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      mockOptimizedData: jest.fn(),
    },
    ingredientOrder: {
      create: jest.fn(),
    },
    mealIngredient: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a single ingredient successfully', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1,
        type: 'SWEETENER'
      };
      mockDatabaseService.ingredient.create.mockResolvedValue(dto);

      await expect(service.create(dto)).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          price_per_unit: 2.5,
          quantity: 100
        }
      });
    });

    it('should create multiple ingredients successfully', async () => {
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
          quantity: 50,
          priority: 2,
          type: 'SEASONING'
        }
      ];
      mockDatabaseService.ingredient.createMany.mockResolvedValue({ count: 2 });

      await expect(service.create(dtos)).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.createMany).toHaveBeenCalledWith({
        data: dtos.map(ingredient => ({
          ...ingredient,
          price_per_unit: parseFloat(ingredient.price_per_unit.toString()),
          quantity: parseInt(ingredient.quantity.toString())
        }))
      });
    });

    it('should throw conflict error if ingredient ID or Name is not unique', async () => {
      mockDatabaseService.ingredient.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create({
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1,
        type: 'SWEETENER'
      })).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return array of ingredients', async () => {
      const mockIngredients = [{
        id: 1,
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1,
        type: 'SWEETENER'
      }];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(mockIngredients);

      const result = await service.findAll();
      expect(result).toEqual(mockIngredients);
      expect(mockDatabaseService.ingredient.findMany).toHaveBeenCalled();
    });

    it('should throw an error if no ingredients are found', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue([]);
      await expect(service.findAll()).rejects.toThrow('No Ingredients');
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by ID', async () => {
      const mockIngredient = {
        id: 1,
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);

      await expect(service.findOne(1)).resolves.toEqual(mockIngredient);
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow('Ingredient Not found');
    });
  });

  describe('update', () => {
    it('should update an ingredient successfully', async () => {
      const mockIngredient = {
        id: 1,
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      const updateData: Prisma.IngredientUpdateInput = { name: 'Brown Sugar' };

      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockDatabaseService.ingredient.update.mockResolvedValue({ ...mockIngredient, ...updateData });

      await expect(service.update(1, updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { name: 'Brown Sugar' }))
        .rejects.toThrow('Ingredient Not found');
    });
  });

  describe('remove', () => {
    it('should delete an ingredient successfully', async () => {
      const mockIngredient = {
        id: 1,
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockDatabaseService.ingredient.delete.mockResolvedValue(mockIngredient);

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow('Ingredient Not found');
    });
  });

  describe('getIngredientStats', () => {
    it('should return correct statistics', async () => {
      const mockIngredients = [
        { id: 1, priority: 1 },
        { id: 2, priority: 1 },
        { id: 3, priority: 2 }
      ];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(mockIngredients);

      const result = await service.getIngredientStats();
      expect(result).toHaveProperty('totalCount', 3);
      expect(result.priorityCount).toEqual({ '1': 2, '2': 1 });
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('getAdvancedIngredientStats', () => {
    it('should return advanced statistics grouped by priority and type', async () => {
      const mockIngredients = [
        { id: 1, name: 'Sugar', priority: 1, type: 'SWEETENER', price_per_unit: 2.5 },
        { id: 2, name: 'Salt', priority: 2, type: 'SEASONING', price_per_unit: 1.5 }
      ];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(mockIngredients);

      const result = await service.getAdvancedIngredientStats();
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('totalIngredients', 2);
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('getMonthlyIngredientStats', () => {
    it('should return monthly statistics for given year', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1,
          type: 'SWEETENER',
          createdAt: new Date('2025-01-15')
        }
      ];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(mockIngredients);

      const result = await service.getMonthlyIngredientStats(2025);
      expect(result).toHaveProperty('year', 2025);
      expect(result).toHaveProperty('monthlyStatistics');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('remove', () => {
    const mockIngredient = {
      id: 1,
      name: 'Sugar', 
      price_per_unit: 2.5,
      quantity: 100,
      priority: 1
    };

    beforeEach(() => {
      mockDatabaseService.mealIngredient = {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 })
      };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockDatabaseService.ingredient.delete.mockResolvedValue(mockIngredient);
    });

    it('should delete related mealIngredients before deleting ingredient', async () => {
      await service.remove(1);

      expect(mockDatabaseService.mealIngredient.deleteMany).toHaveBeenCalledWith({
        where: { ingredientId: 1 }
      });
      expect(mockDatabaseService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 } 
      });
    });

    it('should throw error if mealIngredient deletion fails', async () => {
      mockDatabaseService.mealIngredient.deleteMany.mockRejectedValue(new Error());

      await expect(service.remove(1)).rejects.toThrow('Failed to delete ingredient');
    });

    it('should throw error if ingredient deletion fails', async () => {
      mockDatabaseService.ingredient.delete.mockRejectedValue(new Error());

      await expect(service.remove(1)).rejects.toThrow('Failed to delete ingredient');
    });

    it('should validate ID is a number', async () => {
      await expect(service.remove(NaN)).rejects.toThrow('Invalid ingredient ID');
    });

    it('should parse string ID to number', async () => {
      await service.remove('1' as unknown as number);

      expect(mockDatabaseService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });

  describe('createBudgetBasedOrder', () => {
    it('should create a budget-based order successfully', async () => {
      const mockOptimizedData = {
        priority1Ingredients: [],
        optimizedIngredients: [],
        lastUpdated: new Date()
      };
      
      mockDatabaseService.ingredientOrder.create.mockResolvedValue({
        id: 1,
        budget: 1000,
        priority1Budget: 700,
        otherPriorityBudget: 300,
        totalCost: 800,
        lastUpdated: new Date(),
        ingredients: []
      });
      jest.spyOn(service, 'getOptimizedIngredients').mockResolvedValue(mockOptimizedData);

      const result = await service.createBudgetBasedOrder(1000);
      
      expect(result.orderDetails).toHaveProperty('priority1Ingredients');
      expect(result.orderDetails).toHaveProperty('otherPriorityIngredients');
      expect(result).toHaveProperty('lastUpdated');
    });

    describe('createBudgetBasedOrder - detailed tests', () => {
      const mockOptimizedData = {
        priority1Ingredients: [
          {
            id: 1,
            name: 'Sugar',
            price_per_unit: new Prisma.Decimal(2),
            type: 'SWEETENER', 
            priority: 1,
            quantity: new Prisma.Decimal(100),
            createdAt: new Date()
          }
        ],
        optimizedIngredients: [
          {
            id: 2,
            name: 'Salt', 
            price_per_unit: new Prisma.Decimal(1),
            type: 'SEASONING',
            priority: 2,
            quantity: new Prisma.Decimal(50),
            createdAt: new Date()
          }
        ],
        lastUpdated: new Date()
      };

      it('should calculate correct total costs', async () => {
        const mockStoredOrder = {
          id: 1,
          budget: 1000,
          priority1Budget: 700,
          otherPriorityBudget: 300,
          totalCost: 1000,
          lastUpdated: new Date(),
          ingredients: [
            {
              id: 1,
              name: 'Sugar',
              price_per_unit: new Prisma.Decimal(2),
              quantity: new Prisma.Decimal(350),
              type: 'SWEETENER',
              priority: 1,
              totalCost: 700
            },
            {
              id: 2,
              name: 'Salt',
              price_per_unit: new Prisma.Decimal(1),
              quantity: new Prisma.Decimal(300),
              type: 'SEASONING',
              priority: 2,
              totalCost: 300
            }
          ]
        };

        mockDatabaseService.ingredientOrder.create.mockResolvedValue(mockStoredOrder);
        jest.spyOn(service, 'getOptimizedIngredients').mockResolvedValue(mockOptimizedData);

        const result = await service.createBudgetBasedOrder(1000);

        expect(result.actualCosts).toEqual({
          priority1TotalCost: 700,
          otherPriorityTotalCost: 300,
          totalCost: 1000
        });
      });

      it('should validate ingredient properties in order details', async () => {
        const mockStoredOrder = {
          id: 1,
          budget: 1000,
          ingredients: [
            {
              id: 1,
              name: 'Sugar',
              price_per_unit: new Prisma.Decimal(2),
              quantity: new Prisma.Decimal(350),
              type: 'SWEETENER',
              priority: 1,
              totalCost: 700
            }
          ]
        };

        mockDatabaseService.ingredientOrder.create.mockResolvedValue(mockStoredOrder);
        jest.spyOn(service, 'getOptimizedIngredients').mockResolvedValue(mockOptimizedData);

        const result = await service.createBudgetBasedOrder(1000);

        expect(result.orderDetails.priority1Ingredients[0]).toHaveProperty('name', 'Sugar');
        expect(result.orderDetails.priority1Ingredients[0]).toHaveProperty('type', 'SWEETENER');
        expect(result.orderDetails.priority1Ingredients[0]).toHaveProperty('priority', 1);
      });
    });
  });
});

