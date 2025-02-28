import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
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
    findLowPriceIngredients: jest.fn(),
    findHighPriceIngredients: jest.fn(),
    findOptimalIngredients: jest.fn(),
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
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockIngredientsService.create.mockResolvedValue(dto);

      expect(await controller.create(dto)).toBe(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should create multiple ingredients', async () => {
      const dtos: Prisma.IngredientCreateInput[] = [
        {
          id: '1',
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1
        },
        {
          id: '2',
          name: 'Salt',
          price_per_unit: 1.5,
          quantity: 150,
          priority: 2
        }
      ];
      mockIngredientsService.create.mockResolvedValue(dtos);

      expect(await controller.create(dtos)).toBe(dtos);
      expect(service.create).toHaveBeenCalledWith(dtos);
    });
  });

  describe('findAll', () => {
    it('should return array of ingredients', async () => {
      const result = [
        {
          id: '1',
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1
        }
      ];
      mockIngredientsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ingredient', async () => {
      const result = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockIngredientsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findLowPriceIngredients', () => {
    it('should return ingredients with low prices', async () => {
      const result = [
        {
          id: '1',
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1,
          priceComparison: {
            lowestPrice: 2.5,
            highestPrice: 3.5,
            priceDifference: 1.0,
            totalVariants: 2
          }
        }
      ];
      mockIngredientsService.findLowPriceIngredients.mockResolvedValue(result);

      expect(await controller.findLowPriceIngredients()).toBe(result);
      expect(service.findLowPriceIngredients).toHaveBeenCalled();
    });
  });

  describe('findHighPriceIngredients', () => {
    it('should return ingredients with high prices', async () => {
      const result = [
        {
          id: '1',
          name: 'Sugar',
          price_per_unit: 3.5,
          quantity: 100,
          priority: 1,
          priceComparison: {
            lowestPrice: 2.5,
            highestPrice: 3.5,
            priceDifference: 1.0,
            totalVariants: 2
          }
        }
      ];
      mockIngredientsService.findHighPriceIngredients.mockResolvedValue(result);

      expect(await controller.findHighPriceIngredients()).toBe(result);
      expect(service.findHighPriceIngredients).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const dto: Prisma.IngredientUpdateInput = {
        name: 'Brown Sugar',
        price_per_unit: 3.0
      };
      const result = {
        id: '1',
        name: 'Brown Sugar',
        price_per_unit: 3.0,
        quantity: 100,
        priority: 1
      };
      mockIngredientsService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      const result = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockIngredientsService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getOptimalIngredients', () => {
    beforeEach(() => {
      mockIngredientsService.findOptimalIngredients = jest.fn();
    });

    it('should return optimal ingredients within budget', async () => {
      const result = [
        {
          id: '1',
          name: 'Sugar',
          price_per_unit: 2.5,
          quantity: 100,
          priority: 1
        }
      ];
      mockIngredientsService.findOptimalIngredients.mockResolvedValue(result);

      expect(await controller.getOptimalIngredients(1000)).toBe(result);
      expect(service.findOptimalIngredients).toHaveBeenCalledWith(1000);
    });

    it('should throw BadRequestException for invalid budget', async () => {
      await expect(controller.getOptimalIngredients(-100)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when no ingredients found', async () => {
      mockIngredientsService.findOptimalIngredients.mockResolvedValue([]);
      await expect(controller.getOptimalIngredients(1000)).rejects.toThrow(NotFoundException);
    });
  });
});