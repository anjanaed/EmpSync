import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { addDays, subDays } from 'date-fns';

@Injectable()
export class PersonalizedMealSuggestionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Calculate daily caloric needs using Mifflin-St Jeor Equation
  private calculateCaloricNeeds(heightCm: number, weightKg: number, age: number, gender: string): number {
    const baseBMR =
      10 * weightKg + 6.25 * heightCm - 5 * age + (gender.toLowerCase() === 'male' ? 5 : -161);
    // Assume moderate activity level (multiplier 1.55)
    return baseBMR * 1.55;
  }

  // Get user's preferred meal categories based on past orders
  private async getUserPreferences(userId: string): Promise<string[]> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const pastOrders = await this.databaseService.order.findMany({
      where: {
        employeeId: userId,
        orderDate: { gte: thirtyDaysAgo },
      },
      select: { meals: true },
    });

    const categoryCounts = {};
    for (const order of pastOrders) {
      for (const mealId of order.meals) {
        const meal = await this.databaseService.meal.findUnique({
          where: { id: mealId },
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
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  // AI-driven meal suggestion logic
  async getPersonalizedSuggestions(userId: string): Promise<any[]> {
    // Fetch user data
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { height: true, weight: true, gender: true, dob: true },
    });

    if (!user || !user.height || !user.weight) {
      throw new Error('User data incomplete');
    }

    // Calculate age from dob (assuming dob is a string like 'YYYY-MM-DD')
    const age = user.dob
      ? Math.floor(
          (new Date().getTime() - new Date(user.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        )
      : 30; // Default age if not provided

    // Calculate caloric needs
    const caloricNeeds = this.calculateCaloricNeeds(
      user.height,
      user.weight,
      age,
      user.gender || 'male' // Default gender if not provided
    );

    // Get preferred categories
    const preferredCategories = await this.getUserPreferences(userId);

    // Fetch today's scheduled meals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledMeals = await this.databaseService.scheduledMeal.findFirst({
      where: { date: today },
      select: { breakfast: true, lunch: true, dinner: true },
    });

    if (!scheduledMeals) {
      return [];
    }

    // Combine all meal IDs for today
    const mealIds = [
      ...scheduledMeals.breakfast,
      ...scheduledMeals.lunch,
      ...scheduledMeals.dinner,
    ];

    // Fetch meal details
    const meals = await this.databaseService.meal.findMany({
      where: { id: { in: mealIds } },
    });

    // Simple AI rule-based filtering
    const suggestions = meals
      .filter((meal) => {
        // Match category preference
        const categoryMatch =
          preferredCategories.length === 0 ||
          meal.category.some((cat) => preferredCategories.includes(cat));
        // Estimate calories based on price (placeholder; adjust if calorie data is available)
        const estimatedCalories = meal.price * 100; // Assume $1 ~ 100 kcal (simplified)
        const caloricMatch =
          estimatedCalories >= caloricNeeds * 0.8 && estimatedCalories <= caloricNeeds * 1.2;
        return categoryMatch && caloricMatch;
      })
      .slice(0, 3); // Return top 3 suggestions

    return suggestions.map((meal) => ({
      id: meal.id,
      nameEnglish: meal.nameEnglish,
      nameSinhala: meal.nameSinhala,
      nameTamil: meal.nameTamil,
      description: meal.description,
      price: meal.price,
      imageUrl: meal.imageUrl,
      category: meal.category,
    }));
  }
}