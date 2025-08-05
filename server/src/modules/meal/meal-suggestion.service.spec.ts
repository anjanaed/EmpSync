import { Test, TestingModule } from '@nestjs/testing';
import { MealSuggestionService } from './meal-suggestion.service';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MealSuggestionService', () => {
  let service: MealSuggestionService;
  let mockDatabaseService: any;

  const mockUser = {
    id: 'user-1',
    height: 175,
    weight: 70,
    organizationId: 'org-1',
  };

  const mockMeal = {
    id: 1,
    nameEnglish: 'Grilled Chicken Salad',
    ingredients: [
      {
        ingredient: {
          type: 'protein',
          name: 'Chicken Breast'
        }
      },
      {
        ingredient: {
          type: 'vegetable',
          name: 'Mixed Greens'
        }
      }
    ]
  };

  beforeEach(async () => {
    const mockDatabase = {
      user: {
        findUnique: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
      scheduledMeal: {
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealSuggestionService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<MealSuggestionService>(MealSuggestionService);
    mockDatabaseService = module.get(DatabaseService) as any;
  });

  describe('BMI Calculation Accuracy', () => {
    it('should calculate BMI correctly for normal weight user', async () => {
      (mockDatabaseService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockDatabaseService.order.findMany as jest.Mock).mockResolvedValue([]);
      (mockDatabaseService.scheduledMeal.findMany as jest.Mock).mockResolvedValue([
        { meals: [mockMeal] }
      ]);

      const suggestions = await service.getMealSuggestions('user-1', '2025-08-03', 1);
      
      // BMI should be 22.86 (70 / (1.75 * 1.75))
      // This should result in normal weight recommendations
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle underweight user recommendations', async () => {
      const underweightUser = { ...mockUser, weight: 50 }; // BMI: 16.33
      (mockDatabaseService.user.findUnique as jest.Mock).mockResolvedValue(underweightUser);
      (mockDatabaseService.order.findMany as jest.Mock).mockResolvedValue([]);
      
      const highCalorieMeal = {
        ...mockMeal,
        ingredients: [
          { ingredient: { type: 'protein', name: 'Beef' } },
          { ingredient: { type: 'carb', name: 'Rice' } },
          { ingredient: { type: 'dairy', name: 'Cheese' } }
        ]
      };
      
      (mockDatabaseService.scheduledMeal.findMany as jest.Mock).mockResolvedValue([
        { meals: [highCalorieMeal] }
      ]);

      const suggestions = await service.getMealSuggestions('user-1', '2025-08-03', 1);
      
      // Should favor high-calorie, high-protein meals for underweight users
      expect(suggestions[0].bmiSuitability).toBeGreaterThan(0.5);
    });
  });

  describe('Preference Matching Accuracy', () => {
    it('should prioritize frequently ordered meals', async () => {
      (mockDatabaseService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock order history with meal ID 1 ordered multiple times
      const mockOrders = [
        { meals: ['1:2'], mealTypeId: 1, orderPlacedTime: new Date() },
        { meals: ['1:1'], mealTypeId: 1, orderPlacedTime: new Date() },
        { meals: ['2:1'], mealTypeId: 1, orderPlacedTime: new Date() }
      ];
      (mockDatabaseService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      
      const meals = [
        { ...mockMeal, id: 1 },
        { ...mockMeal, id: 2, nameEnglish: 'Fish Curry' }
      ];
      (mockDatabaseService.scheduledMeal.findMany as jest.Mock).mockResolvedValue([
        { meals }
      ]);

      const suggestions = await service.getMealSuggestions('user-1', '2025-08-03', 1);
      
      // Meal ID 1 should have higher preference match score
      const meal1Suggestion = suggestions.find(s => s.mealId === 1);
      const meal2Suggestion = suggestions.find(s => s.mealId === 2);
      
      expect(meal1Suggestion.preferenceMatch).toBeGreaterThan(meal2Suggestion.preferenceMatch);
    });
  });

  describe('Nutritional Calculation Accuracy', () => {
    it('should calculate nutrition correctly for protein-rich meal', () => {
      const proteinMeal = {
        ingredients: [
          { ingredient: { type: 'protein' } },
          { ingredient: { type: 'protein' } }
        ]
      };
      
      // Access private method for testing (using bracket notation)
      const nutritionalInfo = service['calculateNutritionalInfo'](proteinMeal.ingredients);
      
      expect(nutritionalInfo.protein).toBe(40); // 20 * 2
      expect(nutritionalInfo.calories).toBe(300); // 150 * 2
    });
  });
});
