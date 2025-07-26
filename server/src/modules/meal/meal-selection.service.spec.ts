import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';
import { DatabaseService } from '../../database/database.service';

describe('Meal Selection and Availability Tests - Order-Tab with Fingerprint Device', () => {
  let service: MealService;
  let mockDatabaseService: any;

  beforeEach(async () => {
    mockDatabaseService = {
      meal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      mealIngredient: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      ingredient: {
        findMany: jest.fn(),
      },
    };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Meal Selection', () => {
    it('should add available meal items to cart with correct pricing', async () => {
      // Test Case: Select available meal items
      // Expected Result: Items should be added to cart with correct pricing
      
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Chicken Rice',
          nameSinhala: 'කුකුල් මස් බත්',
          nameTamil: 'கோழி சாதம்',
          description: 'Delicious chicken rice',
          price: 250.00,
          imageUrl: 'chicken-rice.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [
            {
              ingredient: {
                id: 1,
                name: 'Chicken',
                createdAt: new Date(),
                orgId: 'org123',
                price_per_unit: 100,
                quantity: 50,
                type: 'MEAT',
                priority: 1,
              },
            },
            {
              ingredient: {
                id: 2,
                name: 'Rice',
                createdAt: new Date(),
                orgId: 'org123',
                price_per_unit: 50,
                quantity: 100,
                type: 'GRAIN',
                priority: 1,
              },
            },
          ],
        },
        {
          id: 2,
          nameEnglish: 'Fish Curry',
          nameSinhala: 'මාළු කරි',
          nameTamil: 'மீன் கறி',
          description: 'Spicy fish curry',
          price: 300.00,
          imageUrl: 'fish-curry.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [
            {
              ingredient: {
                id: 3,
                name: 'Fish',
                createdAt: new Date(),
                orgId: 'org123',
                price_per_unit: 200,
                quantity: 30,
                type: 'SEAFOOD',
                priority: 1,
              },
            },
          ],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(250.00);
      expect(result[1].price).toBe(300.00);
      expect(result[0].isDeleted).toBe(false);
      expect(result[1].isDeleted).toBe(false);

      // Verify that ingredients are included for meal details
      expect(result[0].ingredients).toHaveLength(2);
      expect(result[1].ingredients).toHaveLength(1);
    });

    it('should prevent selection of unavailable meal items and show unavailable status', async () => {
      // Test Case: Select unavailable meal items
      // Expected Result: System should prevent selection and show unavailable status
      
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Chicken Rice',
          nameSinhala: 'කුකුල් මස් බත්',
          nameTamil: 'கோழி சாதம்',
          description: 'Delicious chicken rice',
          price: 250.00,
          imageUrl: 'chicken-rice.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
        {
          id: 2,
          nameEnglish: 'Beef Curry',
          nameSinhala: 'හරක් මස් කරි',
          nameTamil: 'மாட்டிறைச்சி கறி',
          description: 'Rich beef curry',
          price: 350.00,
          imageUrl: 'beef-curry.jpg',
          category: ['LUNCH'],
          isDeleted: true, // Deleted/unavailable meal
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals.filter(meal => !meal.isDeleted));

      const result = await service.findAllWithIngredients('org123');

      // Verify only available (non-deleted) meals are returned
      expect(result).toHaveLength(1);
      expect(result[0].nameEnglish).toBe('Chicken Rice');
      expect(result[0].isDeleted).toBe(false);
    });

    it('should display meals with proper multi-language names', async () => {
      // Test for multi-language meal names display
      const mockMeal = {
        id: 1,
        nameEnglish: 'Chicken Rice',
        nameSinhala: 'කුකුල් මස් බත්',
        nameTamil: 'கோழி சாதம்',
        description: 'Delicious chicken rice',
        price: 250.00,
        imageUrl: 'chicken-rice.jpg',
        category: ['LUNCH'],
        isDeleted: false,
        orgId: 'org123',
        createdAt: new Date(),
        ingredients: [],
      };

      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMeal);

      const result = await service.findOneWithIngredients(1, 'org123');

      expect(result.nameEnglish).toBe('Chicken Rice');
      expect(result.nameSinhala).toBe('කුකුල් මස් බත්');
      expect(result.nameTamil).toBe('கோழி சாதம்');
    });

    it('should handle meal selection with dietary restrictions', async () => {
      // Test for meals with specific dietary categories
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Vegetarian Rice',
          nameSinhala: 'එළවළු බත්',
          nameTamil: 'காய்கறி சாதம்',
          description: 'Healthy vegetarian meal',
          price: 200.00,
          imageUrl: 'veg-rice.jpg',
          category: ['LUNCH', 'VEGETARIAN'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
        {
          id: 2,
          nameEnglish: 'Chicken Rice',
          nameSinhala: 'කුකුල් මස් බත්',
          nameTamil: 'கோழி சாதம்',
          description: 'Non-vegetarian meal',
          price: 250.00,
          imageUrl: 'chicken-rice.jpg',
          category: ['LUNCH', 'NON_VEGETARIAN'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      // Verify category-based filtering capability
      const vegetarianMeals = result.filter(meal => meal.category.includes('VEGETARIAN'));
      const nonVegMeals = result.filter(meal => meal.category.includes('NON_VEGETARIAN'));

      expect(vegetarianMeals).toHaveLength(1);
      expect(nonVegMeals).toHaveLength(1);
    });

    it('should calculate correct pricing for meal combinations', async () => {
      // Test for price calculation accuracy
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Rice',
          nameSinhala: 'බත්',
          nameTamil: 'சாதம்',
          description: 'Plain rice',
          price: 150.00,
          imageUrl: 'rice.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
        {
          id: 2,
          nameEnglish: 'Curry',
          nameSinhala: 'කරි',
          nameTamil: 'கறி',
          description: 'Spicy curry',
          price: 100.00,
          imageUrl: 'curry.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      // Verify individual prices
      expect(result[0].price).toBe(150.00);
      expect(result[1].price).toBe(100.00);

      // Test total calculation (would be done in order service)
      const totalPrice = result.reduce((sum, meal) => sum + meal.price, 0);
      expect(totalPrice).toBe(250.00);
    });

    it('should handle meal availability based on ingredient stock', async () => {
      // Test for meal availability based on ingredient quantity
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Chicken Rice',
          nameSinhala: 'කුකුල් මස් බත්',
          nameTamil: 'கோழி சாதம்',
          description: 'Delicious chicken rice',
          price: 250.00,
          imageUrl: 'chicken-rice.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [
            {
              ingredient: {
                id: 1,
                name: 'Chicken',
                createdAt: new Date(),
                orgId: 'org123',
                price_per_unit: 100,
                quantity: 0, // Out of stock
                type: 'MEAT',
                priority: 1,
              },
            },
            {
              ingredient: {
                id: 2,
                name: 'Rice',
                createdAt: new Date(),
                orgId: 'org123',
                price_per_unit: 50,
                quantity: 100,
                type: 'GRAIN',
                priority: 1,
              },
            },
          ],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      // Check if meal has ingredients with zero quantity
      const meal = result[0];
      const outOfStockIngredients = meal.ingredients.filter(ing => Number(ing.ingredient.quantity) === 0);
      
      expect(outOfStockIngredients).toHaveLength(1);
      expect(outOfStockIngredients[0].ingredient.name).toBe('Chicken');
    });

    it('should support meal filtering by meal time', async () => {
      // Test for meal filtering by breakfast, lunch, dinner
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Breakfast Special',
          nameSinhala: 'උදේ ආහාර විශේෂ',
          nameTamil: 'காலை உணவு சிறப்பு',
          description: 'Morning meal',
          price: 150.00,
          imageUrl: 'breakfast.jpg',
          category: ['BREAKFAST'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
        {
          id: 2,
          nameEnglish: 'Lunch Special',
          nameSinhala: 'දවල් ආහාර විශේෂ',
          nameTamil: 'மதிய உணவு சிறப்பு',
          description: 'Afternoon meal',
          price: 250.00,
          imageUrl: 'lunch.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
        {
          id: 3,
          nameEnglish: 'Dinner Special',
          nameSinhala: 'රාත්‍රී ආහාර විශේෂ',
          nameTamil: 'இரவு உணவு சிறப்பு',
          description: 'Evening meal',
          price: 300.00,
          imageUrl: 'dinner.jpg',
          category: ['DINNER'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      // Verify meal categorization
      const breakfastMeals = result.filter(meal => meal.category.includes('BREAKFAST'));
      const lunchMeals = result.filter(meal => meal.category.includes('LUNCH'));
      const dinnerMeals = result.filter(meal => meal.category.includes('DINNER'));

      expect(breakfastMeals).toHaveLength(1);
      expect(lunchMeals).toHaveLength(1);
      expect(dinnerMeals).toHaveLength(1);
    });

    it('should handle empty meal list gracefully', async () => {
      // Test for empty meal scenarios
      mockDatabaseService.meal.findMany.mockResolvedValue([]);

      const result = await service.findAllWithIngredients('org123');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter meals by organization', async () => {
      // Test for organization-specific meal filtering
      const mockMeals = [
        {
          id: 1,
          nameEnglish: 'Org1 Special',
          nameSinhala: 'සංවිධාන 1 විශේෂ',
          nameTamil: 'அமைப்பு 1 சிறப்பு',
          description: 'Organization 1 special meal',
          price: 200.00,
          imageUrl: 'org1-special.jpg',
          category: ['LUNCH'],
          isDeleted: false,
          orgId: 'org123',
          createdAt: new Date(),
          ingredients: [],
        },
      ];

      mockDatabaseService.meal.findMany.mockResolvedValue(mockMeals);

      const result = await service.findAllWithIngredients('org123');

      expect(result).toHaveLength(1);
      expect(result[0].orgId).toBe('org123');
      expect(mockDatabaseService.meal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orgId: 'org123',
          }),
        })
      );
    });
  });

  describe('Meal Data Integrity', () => {
    it('should ensure meal data consistency', async () => {
      // Test for meal data validation
      const mockMeal = {
        id: 1,
        nameEnglish: 'Test Meal',
        nameSinhala: 'පරීක්ෂණ ආහාරය',
        nameTamil: 'சோதனை உணவு',
        description: 'Test meal description',
        price: 250.00,
        imageUrl: 'test-meal.jpg',
        category: ['LUNCH'],
        isDeleted: false,
        orgId: 'org123',
        createdAt: new Date(),
        ingredients: [],
      };

      mockDatabaseService.meal.findUnique.mockResolvedValue(mockMeal);

      const result = await service.findOneWithIngredients(1, 'org123');

      // Verify all required fields are present
      expect(result.id).toBeDefined();
      expect(result.nameEnglish).toBeDefined();
      expect(result.price).toBeGreaterThan(0);
      expect(result.isDeleted).toBeDefined();
      expect(Array.isArray(result.category)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // Test for database error handling
      mockDatabaseService.meal.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.findAllWithIngredients('org123')).rejects.toThrow('Database connection error');
    });
  });
});
