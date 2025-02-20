import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { DatabaseService } from '../database/database.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
    it('should create an ingredient successfully', async () => {
      const dto: Prisma.IngredientCreateInput = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
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

    it('should throw conflict error if ingredient ID or Name is not unique', async () => {
      mockDatabaseService.ingredient.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create({
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      })).rejects.toThrow(HttpException);
      expect(mockDatabaseService.ingredient.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of ingredients', async () => {
      const mockIngredients = [{
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      }];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(mockIngredients);

      await expect(service.findAll()).resolves.toEqual(mockIngredients);
      expect(mockDatabaseService.ingredient.findMany).toHaveBeenCalled();
    });

    it('should throw an error if no ingredients are found', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue(null);

      await expect(service.findAll()).rejects.toThrow('No Ingredients');
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by ID', async () => {
      const mockIngredient = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);

      await expect(service.findOne('1')).resolves.toEqual(mockIngredient);
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('Ingredient Not found');
    });
  });

  describe('update', () => {
    it('should update an ingredient successfully', async () => {
      const mockIngredient = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      const updateData: Prisma.IngredientUpdateInput = { name: 'Brown Sugar' };

      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockDatabaseService.ingredient.update.mockResolvedValue({ ...mockIngredient, ...updateData });

      await expect(service.update('1', updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Brown Sugar' }))
        .rejects.toThrow('Ingredient Not found');
    });
  });

  describe('remove', () => {
    it('should delete an ingredient successfully', async () => {
      const mockIngredient = {
        id: '1',
        name: 'Sugar',
        price_per_unit: 2.5,
        quantity: 100,
        priority: 1
      };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockDatabaseService.ingredient.delete.mockResolvedValue(mockIngredient);

      await expect(service.remove('1')).resolves.not.toThrow();
      expect(mockDatabaseService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw an error if ingredient is not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow('Ingredient Not found');
    });
  });
});