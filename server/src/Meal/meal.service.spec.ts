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
  };

  const mockMeal = {
    id: 1,
    name: 'Test Meal',
    description: 'Test Description',
    price: 10.99,
    category: 'Main Course',
    imageUrl: 'http://example.com/image.jpg',
    createdAt: new Date()
  };

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal with all fields', async () => {
      const createDto = {
        name: 'Test Meal',
        description: 'Test Description',
        price: 10.99,
        category: 'Main Course',
        imageUrl: 'http://example.com/image.jpg'
      };

      mockDatabaseService.meal.create.mockResolvedValue({ ...createDto, id: 1, createdAt: expect.any(Date) });

      const result = await service.create(createDto);
      expect(result).toMatchObject(createDto);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create a meal with only required fields', async () => {
      const createDto = {
        name: 'Test Meal',
        price: 10.99,
        category: 'Main Course'
      };

      mockDatabaseService.meal.create.mockResolvedValue({ 
        ...createDto, 
        id: 1, 
        description: null,
        imageUrl: null,
        createdAt: expect.any(Date) 
      });

      const result = await service.create(createDto);
      expect(result).toMatchObject(createDto);
    });

    it('should throw BadRequestException on create error', async () => {
      const invalidDto = {
        price: 10.99,
        category: 'Main Course'
      };

      mockDatabaseService.meal.create.mockRejectedValue(new Error('Name is required'));

      await expect(service.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all meals', async () => {
      const meals = [
        { ...mockMeal },
        { ...mockMeal, id: 2, name: 'Test Meal 2' }
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(meals);

      const result = await service.findAll();
      expect(result).toEqual(meals);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no meals exist', async () => {
      mockDatabaseService.meal.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a meal by id', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMeal);

      const result = await service.findOne(1);
      expect(result).toEqual(mockMeal);
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update all meal fields', async () => {
      const updateDto = {
        name: 'Updated Meal',
        description: 'Updated Description',
        price: 15.99,
        category: 'Dessert',
        imageUrl: 'http://example.com/updated.jpg'
      };

      const updatedMeal = { ...mockMeal, ...updateDto };
      mockDatabaseService.meal.update.mockResolvedValue(updatedMeal);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(updatedMeal);
    });

    it('should update partial meal fields', async () => {
      const updateDto = {
        price: 15.99,
        category: 'Dessert'
      };

      const updatedMeal = { ...mockMeal, ...updateDto };
      mockDatabaseService.meal.update.mockResolvedValue(updatedMeal);

      const result = await service.update(1, updateDto);
      expect(result.price).toEqual(updateDto.price);
      expect(result.category).toEqual(updateDto.category);
      expect(result.name).toEqual(mockMeal.name);
    });

    it('should throw BadRequestException on update error', async () => {
      mockDatabaseService.meal.update.mockRejectedValue(new Error('Meal not found'));

      await expect(service.update(999, { price: 15.99 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      mockDatabaseService.meal.delete.mockResolvedValue(mockMeal);

      const result = await service.remove(1);
      expect(result).toEqual(mockMeal);
    });

    it('should throw BadRequestException when trying to delete non-existent meal', async () => {
      mockDatabaseService.meal.delete.mockRejectedValue(new Error('Meal not found'));

      await expect(service.remove(999)).rejects.toThrow(BadRequestException);
    });
  });
});
