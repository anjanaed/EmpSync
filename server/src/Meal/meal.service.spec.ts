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
    id: '1',
    nameEnglish: 'Test Meal',
    nameSinhala: 'පරික්ෂණ කෑම',
    nameTamil: 'சோதனை உணவு',
    description: 'Test Description',
    price: 9.99,
    imageUrl: 'test.jpg',
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
    it('should create a meal', async () => {
      mockDatabaseService.meal.create.mockResolvedValue(mockMeal);
      const result = await service.create(mockMeal);
      expect(result).toEqual(mockMeal);
    });

    it('should throw BadRequestException on create error', async () => {
      mockDatabaseService.meal.create.mockRejectedValue(new Error('Error creating meal'));
      await expect(service.create(mockMeal)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all meals', async () => {
      const meals = [mockMeal];
      mockDatabaseService.meal.findMany.mockResolvedValue(meals);
      const result = await service.findAll();
      expect(result).toEqual(meals);
    });
  });

  describe('findOne', () => {
    it('should return a meal by id', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMeal);
      const result = await service.findOne('1');
      expect(result).toEqual(mockMeal);
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockDatabaseService.meal.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a meal', async () => {
      mockDatabaseService.meal.update.mockResolvedValue(mockMeal);
      const result = await service.update('1', mockMeal);
      expect(result).toEqual(mockMeal);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      mockDatabaseService.meal.delete.mockResolvedValue(mockMeal);
      const result = await service.remove('1');
      expect(result).toEqual(mockMeal);
    });

    it('should throw BadRequestException when trying to delete non-existent meal', async () => {
      mockDatabaseService.meal.delete.mockRejectedValue(new Error('Meal not found'));
      await expect(service.remove('999')).rejects.toThrow(BadRequestException);
    });
  });
});
