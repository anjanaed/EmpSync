import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredient.service';
import { DatabaseService } from '../../database/database.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockDatabaseService = {
  ingredient: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mealIngredient: {
    deleteMany: jest.fn(),
  },
};

describe('IngredientsService', () => {
  let service: IngredientsService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new ingredient', async () => {
      const dto = { name: 'Salt',orgId:'org123' };
      const mockIngredient = { id: 1, ...dto };
      mockDatabaseService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(dto);
      expect(result).toEqual(mockIngredient);
      expect(mockDatabaseService.ingredient.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw an exception on error', async () => {
      mockDatabaseService.ingredient.create.mockRejectedValue(new Error());
      await expect(service.create({ name: 'Salt', orgId:'org123' })).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [{ id: 1 }, { id: 2 }];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(ingredients);
      const result = await service.findAll();
      expect(result).toEqual(ingredients);
    });

    it('should throw if no ingredients', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue([]);
      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return one ingredient', async () => {
      const ingredient = { id: 1 };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      const result = await service.findOne(1);
      expect(result).toEqual(ingredient);
    });

    it('should throw if invalid id', async () => {
      await expect(service.findOne(NaN)).rejects.toThrow(HttpException);
    });

    it('should throw if not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update and return ingredient', async () => {
      const updated = { id: 1, name: 'Sugar' };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(updated);
      mockDatabaseService.ingredient.update.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Sugar' });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      const id = 1;
      mockDatabaseService.ingredient.findUnique.mockResolvedValue({ id });
      mockDatabaseService.mealIngredient.deleteMany.mockResolvedValue({});
      mockDatabaseService.ingredient.delete.mockResolvedValue({ id });
      const result = await service.remove(id);
      expect(result).toEqual({ id });
    });
  });

  describe('findByOrgId', () => {
    it('should return ingredients by orgId', async () => {
      const orgId = 'org123';
      const ingredients = [{ id: 1 }, { id: 2 }];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(ingredients);
      const result = await service.findByOrgId(orgId);
      expect(result).toEqual(ingredients);
    });

    it('should throw if no ingredients found', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue([]);
      await expect(service.findByOrgId('org123')).rejects.toThrow(HttpException);
    });

    it('should throw if invalid orgId', async () => {
      await expect(service.findByOrgId(null)).rejects.toThrow(HttpException);
    });
  });
});
