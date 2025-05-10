import { Test, TestingModule } from '@nestjs/testing';
import { MealsServingService } from './meals-serving.service';
import { DatabaseService } from '../../database/database.service';

describe('MealsServingService', () => {
  let service: MealsServingService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsServingService,
        {
          provide: DatabaseService,
          useValue: {
            meal: {
              findUnique: jest.fn(), // Mock the `findUnique` method
            },
            order: {
              findMany: jest.fn(), // Mock the `findMany` method
            },
          },
        },
      ],
    }).compile();

    service = module.get<MealsServingService>(MealsServingService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve a meal by ID', async () => {
    const mockMeal = {
      id: 1,
      nameEnglish: 'Mock Meal',
      nameSinhala: 'Mock Meal Sinhala',
      nameTamil: 'Mock Meal Tamil',
      description: 'A mock meal description',
      price: 100,
      imageUrl: 'http://example.com/mock-meal.jpg',
      category: ['Mock Category'],
      createdAt: new Date(),
      ingredients: [],
    };

    jest.spyOn(databaseService.meal, 'findUnique').mockResolvedValue(mockMeal);

    const result = await service.findMealsServingByMealId(1);
    expect(result).toEqual(mockMeal);
    expect(databaseService.meal.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  });

  it('should throw NotFoundException if meal is not found', async () => {
    jest.spyOn(databaseService.meal, 'findUnique').mockResolvedValue(null);

    await expect(service.findMealsServingByMealId(1)).rejects.toThrowError('Meal not found');
  });
});
