import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MealService', () => {
  let service: MealService;
  let db: any;

  const mockDatabaseService = {
    meal: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    mealIngredient: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockDatabaseService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<MealService>(MealService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a meal with ingredients', async () => {
    const mealData = {
      nameEnglish: 'Fried Rice',
      nameSinhala: 'බත්',
      nameTamil: 'சோறு',
      price: 500,
      isDeleted: false,
      organization: {
        connect: { id: 'ORG1' },
      },
    };
    const ingredients = [{ ingredientId: 1 }];
    mockDatabaseService.meal.create.mockResolvedValue('createdMeal');

    const result = await service.createWithIngredients(
      mealData,
      ingredients,
      'ORG1',
    );
    expect(result).toBe('createdMeal');
  });

  it('should find a meal with ingredients', async () => {
    mockDatabaseService.meal.findFirst.mockResolvedValue('meal');
    const result = await service.findOneWithIngredients(1, 'ORG1');
    expect(result).toBe('meal');
  });

  it('should find all meals', async () => {
    mockDatabaseService.meal.findMany.mockResolvedValue(['meal1', 'meal2']);
    const result = await service.findAllWithIngredients('ORG1');
    expect(result).toEqual(['meal1', 'meal2']);
  });

  it('should update a meal with ingredients', async () => {
    mockDatabaseService.meal.findFirst.mockResolvedValue({ id: 1 });
    mockDatabaseService.meal.update.mockResolvedValue('updatedMeal');

    const mealData = {
      nameEnglish: { set: 'Updated Fried Rice' },
      nameSinhala: { set: 'යාවත්කාලීන බත්' },
      nameTamil: { set: 'புதுப்பித்த சோறு' },
      price: { set: 600 },
    };

    const result = await service.updateWithIngredients(
      1,
      mealData,
      [{ ingredientId: 1 }],
      'ORG1',
    );
    expect(result).toBe('updatedMeal');
  });

  it('should throw NotFoundException if meal not found when updating', async () => {
    mockDatabaseService.meal.findFirst.mockResolvedValue(null);
    await expect(
      service.updateWithIngredients(1, {}, [], 'ORG1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should soft delete a meal', async () => {
    mockDatabaseService.meal.findFirst.mockResolvedValue({ id: 1 });
    mockDatabaseService.meal.update.mockResolvedValue('deletedMeal');
    const result = await service.softDelete(1, 'ORG1');
    expect(result).toBe('deletedMeal');
  });

  it('should throw NotFoundException if meal not found during delete', async () => {
    mockDatabaseService.meal.findFirst.mockResolvedValue(null);
    await expect(service.softDelete(1, 'ORG1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
