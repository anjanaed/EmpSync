import { Test, TestingModule } from '@nestjs/testing';
import { PersonalizedMealSuggestionsService } from './personalized-meal-suggestions.service';

describe('PersonalizedMealSuggestionsService', () => {
  let service: PersonalizedMealSuggestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalizedMealSuggestionsService],
    }).compile();

    service = module.get<PersonalizedMealSuggestionsService>(PersonalizedMealSuggestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
private async getUserPreferences(userId: string): Promise<string[]> {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const pastOrders = await this.databaseService.order.findMany({
    where: {
      employeeId: userId,
      orderDate: { gte: thirtyDaysAgo },
    },
    select: { meals: true },
  });

  const categoryCounts: Record<string, number> = {};
  for (const order of pastOrders) {
    for (const mealId of order.meals) {
      const meal = await this.databaseService.meal.findUnique({
        where: { id: Number(mealId) }, // Cast mealId to number
        select: { category: true },
      });
      if (meal && meal.category) {
        for (const category of meal.category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      }
    }
  }

  // Return top 3 categories
  return Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number)) // Ensure values are treated as numbers
    .slice(0, 3)
    .map(([category]) => category);
}
