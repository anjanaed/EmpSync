import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredient.controller';
import { IngredientsService } from './ingredient.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByOrgId: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockService,
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
    it('should create an ingredient', async () => {
      const dto: Prisma.IngredientCreateInput = { 
        name: 'Salt',
        organization: {
          connect: {
            id: 'org1'
          }
        }
      };
      const result = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org1',
        createdAt: new Date()
      };
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual({
        message: 'Ingredient created successfully',
        data: result,
      });
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should handle error on create', async () => {
      const dto: Prisma.IngredientCreateInput = { 
        name: 'Salt',
        organization: {
          connect: {
            id: 'org1'
          }
        }
      };
      mockService.create.mockRejectedValue(new Error('Create failed'));

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should handle service throwing HttpException', async () => {
      const dto: Prisma.IngredientCreateInput = { 
        name: 'Salt',
        organization: {
          connect: {
            id: 'org1'
          }
        }
      };
      mockService.create.mockRejectedValue(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      );

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
    });

    it('should create ingredient with complex organization data', async () => {
      const dto: Prisma.IngredientCreateInput = { 
        name: 'Black Pepper',
        organization: {
          connectOrCreate: {
            where: { id: 'new-org' },
            create: {
              id: 'new-org',
              name: 'New Organization',
              contactEmail: 'contact@neworg.com'
            }
          }
        }
      };
      const result = { 
        id: 2, 
        name: 'Black Pepper', 
        orgId: 'new-org',
        createdAt: new Date()
      };
      mockService.create.mockResolvedValue(result);

      const response = await controller.create(dto);
      expect(response).toEqual({
        message: 'Ingredient created successfully',
        data: result,
      });
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [
        { id: 1, name: 'Salt', orgId: 'org1', createdAt: new Date() },
        { id: 2, name: 'Sugar', orgId: 'org1', createdAt: new Date() }
      ];
      mockService.findAll.mockResolvedValue(ingredients);
      
      expect(await controller.findAll()).toEqual(ingredients);
      expect(mockService.findAll).toHaveBeenCalled();
    });

    it('should handle findAll errors', async () => {
      mockService.findAll.mockRejectedValue(
        new HttpException('No Ingredients', HttpStatus.NOT_FOUND)
      );
      
      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return one ingredient', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org1', createdAt: new Date() };
      mockService.findOne.mockResolvedValue(ingredient);
      
      expect(await controller.findOne(1)).toEqual(ingredient);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle findOne errors', async () => {
      mockService.findOne.mockRejectedValue(
        new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND)
      );
      
      await expect(controller.findOne(99)).rejects.toThrow(HttpException);
    });

    it('should handle string id parameter', async () => {
      const ingredient = { id: 1, name: 'Salt', orgId: 'org1', createdAt: new Date() };
      mockService.findOne.mockResolvedValue(ingredient);
      
      expect(await controller.findOne('1' as any)).toEqual(ingredient);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updateDto: Prisma.IngredientUpdateInput = { name: 'Sugar' };
      const updatedIngredient = { 
        id: 1, 
        name: 'Sugar', 
        orgId: 'org1', 
        createdAt: new Date() 
      };
      mockService.update.mockResolvedValue(updatedIngredient);
      
      expect(await controller.update(1, updateDto)).toEqual(updatedIngredient);
      expect(mockService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle update errors', async () => {
      const updateDto: Prisma.IngredientUpdateInput = { name: 'Sugar' };
      mockService.update.mockRejectedValue(
        new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND)
      );
      
      await expect(controller.update(99, updateDto)).rejects.toThrow(HttpException);
    });

    it('should update with organization relationship', async () => {
      const updateDto: Prisma.IngredientUpdateInput = { 
        name: 'Updated Salt',
        organization: {
          connect: {
            id: 'new-org'
          }
        }
      };
      const updatedIngredient = { 
        id: 1, 
        name: 'Updated Salt', 
        orgId: 'new-org', 
        createdAt: new Date() 
      };
      mockService.update.mockResolvedValue(updatedIngredient);
      
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(updatedIngredient);
    });
  });

  describe('getIngredientsByOrgId', () => {
    it('should get ingredients by org ID', async () => {
      const ingredients = [
        { id: 1, name: 'Salt', orgId: 'org1', createdAt: new Date() },
        { id: 2, name: 'Sugar', orgId: 'org1', createdAt: new Date() }
      ];
      mockService.findByOrgId.mockResolvedValue(ingredients);
      
      expect(await controller.getIngredientsByOrgId('org1')).toEqual(ingredients);
      expect(mockService.findByOrgId).toHaveBeenCalledWith('org1');
    });

    it('should handle empty org results', async () => {
      mockService.findByOrgId.mockRejectedValue(
        new HttpException('No ingredients found for the organization', HttpStatus.NOT_FOUND)
      );
      
      await expect(controller.getIngredientsByOrgId('non-existent-org')).rejects.toThrow(HttpException);
    });

    it('should handle invalid org ID', async () => {
      mockService.findByOrgId.mockRejectedValue(
        new HttpException('Invalid organization ID', HttpStatus.BAD_REQUEST)
      );
      
      await expect(controller.getIngredientsByOrgId('')).rejects.toThrow(HttpException);
    });

    it('should handle null org ID', async () => {
      mockService.findByOrgId.mockRejectedValue(
        new HttpException('Invalid organization ID', HttpStatus.BAD_REQUEST)
      );
      
      await expect(controller.getIngredientsByOrgId(null)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete an ingredient', async () => {
      const deletedIngredient = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org1', 
        createdAt: new Date() 
      };
      mockService.remove.mockResolvedValue(deletedIngredient);
      
      expect(await controller.remove(1)).toEqual(deletedIngredient);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle remove errors', async () => {
      mockService.remove.mockRejectedValue(
        new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND)
      );
      
      await expect(controller.remove(99)).rejects.toThrow(HttpException);
    });

    it('should handle string id in remove', async () => {
      const deletedIngredient = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org1', 
        createdAt: new Date() 
      };
      mockService.remove.mockResolvedValue(deletedIngredient);
      
      expect(await controller.remove('1' as any)).toEqual(deletedIngredient);
      expect(mockService.remove).toHaveBeenCalledWith('1');
    });

    it('should handle cascade deletion', async () => {
      // Test that related meal ingredients are also handled
      const deletedIngredient = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org1', 
        createdAt: new Date() 
      };
      mockService.remove.mockResolvedValue(deletedIngredient);
      
      const result = await controller.remove(1);
      expect(result).toEqual(deletedIngredient);
      // The service should handle cascade deletion internally
    });
  });

  describe('Error Handling', () => {
    it('should properly propagate service exceptions', async () => {
      const customError = new HttpException(
        'Custom error message', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      mockService.findAll.mockRejectedValue(customError);
      
      await expect(controller.findAll()).rejects.toThrow(customError);
    });

    it('should handle unexpected errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Unexpected error'));
      
      await expect(controller.findAll()).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create
      const createDto: Prisma.IngredientCreateInput = { 
        name: 'Salt',
        organization: {
          connect: { id: 'org1' }
        }
      };
      const createdIngredient = { 
        id: 1, 
        name: 'Salt', 
        orgId: 'org1', 
        createdAt: new Date() 
      };
      mockService.create.mockResolvedValue(createdIngredient);

      const createResult = await controller.create(createDto);
      expect(createResult.message).toBe('Ingredient created successfully');
      expect(createResult.data).toEqual(createdIngredient);

      // Read
      mockService.findOne.mockResolvedValue(createdIngredient);
      const findResult = await controller.findOne(1);
      expect(findResult).toEqual(createdIngredient);

      // Update
      const updateDto: Prisma.IngredientUpdateInput = { name: 'Sea Salt' };
      const updatedIngredient = { ...createdIngredient, name: 'Sea Salt' };
      mockService.update.mockResolvedValue(updatedIngredient);
      
      const updateResult = await controller.update(1, updateDto);
      expect(updateResult.name).toBe('Sea Salt');

      // Delete
      mockService.remove.mockResolvedValue(updatedIngredient);
      const deleteResult = await controller.remove(1);
      expect(deleteResult).toEqual(updatedIngredient);
    });

    it('should handle organization-specific operations', async () => {
      const orgId = 'org123';
      const orgIngredients = [
        { id: 1, name: 'Salt', orgId, createdAt: new Date() },
        { id: 2, name: 'Pepper', orgId, createdAt: new Date() }
      ];

      mockService.findByOrgId.mockResolvedValue(orgIngredients);
      
      const result = await controller.getIngredientsByOrgId(orgId);
      expect(result).toHaveLength(2);
      expect(result.every(ingredient => ingredient.orgId === orgId)).toBe(true);
    });
  });
});