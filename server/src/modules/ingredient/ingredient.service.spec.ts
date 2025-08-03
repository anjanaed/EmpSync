import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredient.service';
import { DatabaseService } from '../../database/database.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
      const dto: Prisma.IngredientCreateInput = {
        name: 'Salt',
        organization: {
          connect: {
            id: 'org123'
          }
        }
      };
      const mockIngredient = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org123',
        createdAt: new Date(),
        organization: { id: 'org123', name: 'Test Org' }
      };
      mockDatabaseService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(dto);
      expect(result).toEqual(mockIngredient);
      expect(mockDatabaseService.ingredient.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw an exception on error', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Salt',
        organization: {
          connect: {
            id: 'org123'
          }
        }
      };
      mockDatabaseService.ingredient.create.mockRejectedValue(new Error('Database error'));
      
      await expect(service.create(dto)).rejects.toThrow(HttpException);
      await expect(service.create(dto)).rejects.toThrow('Failed to create ingredient');
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [
        { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() }, 
        { id: 2, name: 'Sugar', orgId: 'org123', createdAt: new Date() }
      ];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(ingredients);
      
      const result = await service.findAll();
      expect(result).toEqual(ingredients);
      expect(mockDatabaseService.ingredient.findMany).toHaveBeenCalledWith({});
    });

    it('should throw if no ingredients', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue([]);
      
      await expect(service.findAll()).rejects.toThrow(HttpException);
      await expect(service.findAll()).rejects.toThrow('No Ingredients');
    });

    it('should throw if ingredients is null', async () => {
      mockDatabaseService.ingredient.findMany.mockResolvedValue(null);
      
      await expect(service.findAll()).rejects.toThrow(HttpException);
      await expect(service.findAll()).rejects.toThrow('No Ingredients');
    });
  });

  describe('findOne', () => {
    it('should return one ingredient', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      
      const result = await service.findOne(1);
      expect(result).toEqual(ingredient);
      expect(mockDatabaseService.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should throw if invalid id', async () => {
      await expect(service.findOne(NaN)).rejects.toThrow(HttpException);
      await expect(service.findOne(NaN)).rejects.toThrow('Invalid ingredient ID');
    });

    it('should throw if not found', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);
      
      await expect(service.findOne(99)).rejects.toThrow(HttpException);
      await expect(service.findOne(99)).rejects.toThrow('Ingredient Not found');
    });

    it('should handle string id conversion', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      
      const result = await service.findOne('1' as any);
      expect(result).toEqual(ingredient);
      expect(mockDatabaseService.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });

  describe('update', () => {
    it('should update and return ingredient', async () => {
      const existingIngredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      const updateData: Prisma.IngredientUpdateInput = { name: 'Sugar' };
      const updatedIngredient = { id: 1, name: 'Sugar', orgId: 'org123', createdAt: new Date() };
      
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(existingIngredient);
      mockDatabaseService.ingredient.update.mockResolvedValue(updatedIngredient);
      
      const result = await service.update(1, updateData);
      expect(result).toEqual(updatedIngredient);
      expect(mockDatabaseService.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw if ingredient not found during update', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);
      
      await expect(service.update(99, { name: 'Sugar' })).rejects.toThrow(HttpException);
      await expect(service.update(99, { name: 'Sugar' })).rejects.toThrow('Ingredient Not found');
    });

    it('should throw if invalid id during update', async () => {
      await expect(service.update(NaN, { name: 'Sugar' })).rejects.toThrow(HttpException);
      await expect(service.update(NaN, { name: 'Sugar' })).rejects.toThrow('Invalid ingredient ID');
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      mockDatabaseService.mealIngredient.deleteMany.mockResolvedValue({ count: 2 });
      mockDatabaseService.ingredient.delete.mockResolvedValue(ingredient);
      
      const result = await service.remove(1);
      expect(result).toEqual(ingredient);
      
      // Verify the correct sequence of operations
      expect(mockDatabaseService.mealIngredient.deleteMany).toHaveBeenCalledWith({
        where: { ingredientId: 1 }
      });
      expect(mockDatabaseService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should throw if ingredient not found during removal', async () => {
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(null);
      
      await expect(service.remove(99)).rejects.toThrow(HttpException);
      await expect(service.remove(99)).rejects.toThrow('Ingredient Not found');
    });

    it('should throw if deletion fails', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      mockDatabaseService.mealIngredient.deleteMany.mockResolvedValue({ count: 0 });
      mockDatabaseService.ingredient.delete.mockRejectedValue(new Error('Database error'));
      
      await expect(service.remove(1)).rejects.toThrow(HttpException);
      await expect(service.remove(1)).rejects.toThrow('Failed to delete ingredient');
    });

    it('should handle meal ingredient deletion failure', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      mockDatabaseService.mealIngredient.deleteMany.mockRejectedValue(new Error('Database error'));
      
      await expect(service.remove(1)).rejects.toThrow(HttpException);
      await expect(service.remove(1)).rejects.toThrow('Failed to delete ingredient');
    });
  });

  describe('findByOrgId', () => {
    it('should return ingredients by orgId', async () => {
      const orgId = 'org123';
      const ingredients = [
        { id: 1, name: 'Salt', orgId: 'org123', createdAt: new Date() }, 
        { id: 2, name: 'Sugar', orgId: 'org123', createdAt: new Date() }
      ];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(ingredients);
      
      const result = await service.findByOrgId(orgId);
      expect(result).toEqual(ingredients);
      expect(mockDatabaseService.ingredient.findMany).toHaveBeenCalledWith({
        where: { orgId: orgId }
      });
    });

    it('should throw if no ingredients found', async () => {
      const orgId = 'org123';
      mockDatabaseService.ingredient.findMany.mockResolvedValue([]);
      
      await expect(service.findByOrgId(orgId)).rejects.toThrow(HttpException);
      await expect(service.findByOrgId(orgId)).rejects.toThrow('No ingredients found for the organization');
    });

    it('should throw if invalid orgId', async () => {
      await expect(service.findByOrgId(null)).rejects.toThrow(HttpException);
      await expect(service.findByOrgId(null)).rejects.toThrow('Invalid organization ID');
    });

    it('should throw if orgId is not a string', async () => {
      await expect(service.findByOrgId(123 as any)).rejects.toThrow(HttpException);
      await expect(service.findByOrgId(123 as any)).rejects.toThrow('Invalid organization ID');
    });

    it('should throw if orgId is empty string', async () => {
      await expect(service.findByOrgId('')).rejects.toThrow(HttpException);
      await expect(service.findByOrgId('')).rejects.toThrow('Invalid organization ID');
    });

    it('should throw if ingredients is null for orgId', async () => {
      const orgId = 'org123';
      mockDatabaseService.ingredient.findMany.mockResolvedValue(null);
      
      await expect(service.findByOrgId(orgId)).rejects.toThrow(HttpException);
      await expect(service.findByOrgId(orgId)).rejects.toThrow('No ingredients found for the organization');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large ingredient IDs', async () => {
      const largeId = 999999999;
      const ingredient = { id: largeId, name: 'Salt', orgId: 'org123', createdAt: new Date() };
      mockDatabaseService.ingredient.findUnique.mockResolvedValue(ingredient);
      
      const result = await service.findOne(largeId);
      expect(result).toEqual(ingredient);
    });

    it('should handle special characters in ingredient names', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Salt & Pepper Mix!',
        organization: {
          connect: {
            id: 'org123'
          }
        }
      };
      const mockIngredient = { 
        id: 1, 
        name: 'Salt & Pepper Mix!', 
        orgId: 'org123',
        createdAt: new Date()
      };
      mockDatabaseService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(dto);
      expect(result).toEqual(mockIngredient);
    });

    it('should handle very long orgId', async () => {
      const longOrgId = 'a'.repeat(100);
      const ingredients = [{ 
        id: 1, 
        name: 'Salt', 
        orgId: longOrgId, 
        createdAt: new Date() 
      }];
      mockDatabaseService.ingredient.findMany.mockResolvedValue(ingredients);
      
      const result = await service.findByOrgId(longOrgId);
      expect(result).toEqual(ingredients);
    });

    it('should handle organization connection in create', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Black Pepper',
        organization: {
          connect: {
            id: 'complex-org-id-123'
          }
        }
      };
      const mockIngredient = { 
        id: 1, 
        name: 'Black Pepper', 
        orgId: 'complex-org-id-123',
        createdAt: new Date()
      };
      mockDatabaseService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(dto);
      expect(result).toEqual(mockIngredient);
      expect(mockDatabaseService.ingredient.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should handle create with organization connectOrCreate', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Turmeric',
        organization: {
          connectOrCreate: {
            where: { id: 'new-org-123' },
            create: {
              id: 'new-org-123',
              name: 'New Organization',
              contactEmail: 'contact@neworg.com'
            }
          }
        }
      };
      const mockIngredient = { 
        id: 1, 
        name: 'Turmeric', 
        orgId: 'new-org-123',
        createdAt: new Date()
      };
      mockDatabaseService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(dto);
      expect(result).toEqual(mockIngredient);
    });
  });

  describe('Database Error Scenarios', () => {
    it('should handle database connection errors in create', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Salt',
        organization: {
          connect: {
            id: 'org123'
          }
        }
      };
      mockDatabaseService.ingredient.create.mockRejectedValue(new Error('Connection timeout'));
      
      await expect(service.create(dto)).rejects.toThrow(HttpException);
      await expect(service.create(dto)).rejects.toThrow('Failed to create ingredient');
    });

    it('should handle constraint violations', async () => {
      const dto: Prisma.IngredientCreateInput = {
        name: 'Salt',
        organization: {
          connect: {
            id: 'non-existent-org'
          }
        }
      };
      mockDatabaseService.ingredient.create.mockRejectedValue(
        new Error('Foreign key constraint failed')
      );
      
      await expect(service.create(dto)).rejects.toThrow(HttpException);
    });


  });
});