import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface NutritionalInfo {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
}

interface UserProfile {
  id: string;
  height: number;
  weight: number;
  bmi: number;
  preferredMeals: number[];
  orderHistory: any[];
}

interface MealSuggestion {
  mealId: number;
  name: string;
  score: number;
  reason: string;
  nutritionalMatch: number;
  preferenceMatch: number;
  bmiSuitability: number;
}

@Injectable()
export class MealSuggestionService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get meal suggestions for a user based on BMI, preferences, and nutritional content
   */
  async getMealSuggestions(
    userId: string,
    date: string,
    mealTypeId: number,
    orgId?: string,
  ): Promise<MealSuggestion[]> {
    try {
      // Get user profile with BMI calculation
      const userProfile = await this.getUserProfile(userId);
      
      // Get available meals for the date and meal type
      const availableMeals = await this.getAvailableMeals(date, mealTypeId, orgId);
      
      if (availableMeals.length === 0) {
        throw new NotFoundException('No meals available for the specified date and meal type');
      }

      // Calculate suggestions for each meal
      const suggestions = await Promise.all(
        availableMeals.map(meal => this.calculateMealScore(meal, userProfile))
      );

      // Sort by score (highest first) and return top suggestions
      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(5, suggestions.length)); // Return top 5 suggestions

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get meal suggestions: ${error.message}`);
    }
  }

  /**
   * Get user profile including BMI and order history
   */
  private async getUserProfile(userId: string): Promise<UserProfile> {
    // Get user basic info
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        height: true,
        weight: true,
        organizationId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate BMI if height and weight are available, otherwise use default
    let bmi = 22.5; // Default BMI (normal weight)
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      bmi = user.weight / (heightInMeters * heightInMeters);
    }

    // Get user's order history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderHistory = await this.databaseService.order.findMany({
      where: {
        employeeId: userId,
        orderPlacedTime: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        meals: true,
        mealTypeId: true,
        orderPlacedTime: true,
      },
    });

    // Extract preferred meals from order history
    const mealFrequency: { [key: number]: number } = {};
    
    orderHistory.forEach(order => {
      order.meals.forEach(mealEntry => {
        const [mealIdStr, countStr] = mealEntry.split(':');
        const mealId = parseInt(mealIdStr);
        const count = parseInt(countStr);
        
        if (!isNaN(mealId) && !isNaN(count)) {
          mealFrequency[mealId] = (mealFrequency[mealId] || 0) + count;
        }
      });
    });

    // Get top preferred meals (ordered more than once)
    const preferredMeals = Object.entries(mealFrequency)
      .filter(([_, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .map(([mealId]) => parseInt(mealId));

    return {
      id: userId,
      height: user.height || 170, // Default height in cm
      weight: user.weight || 65,  // Default weight in kg
      bmi,
      preferredMeals,
      orderHistory,
    };
  }

  /**
   * Get available meals for a specific date and meal type
   */
  private async getAvailableMeals(date: string, mealTypeId: number, orgId?: string) {
    const scheduleResponse = await this.databaseService.scheduledMeal.findMany({
      where: {
        date: new Date(date + 'T00:00:00.000Z'),
        mealTypeId: mealTypeId,
        orgId: orgId || undefined,
      },
      include: {
        meals: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // Flatten meals from schedule
    const meals = scheduleResponse.flatMap(schedule => schedule.meals);
    return meals;
  }

  /**
   * Calculate meal score based on user profile
   */
  private async calculateMealScore(meal: any, userProfile: UserProfile): Promise<MealSuggestion> {
    // Calculate nutritional information from ingredients
    const nutritionalInfo = this.calculateNutritionalInfo(meal.ingredients);
    
    // Calculate different scoring factors
    const nutritionalMatch = this.calculateNutritionalMatch(nutritionalInfo, userProfile.bmi);
    const preferenceMatch = this.calculatePreferenceMatch(meal.id, userProfile.preferredMeals);
    const bmiSuitability = this.calculateBMISuitability(nutritionalInfo, userProfile.bmi);
    
    // Calculate overall score (weighted average)
    const score = (
      nutritionalMatch * 0.4 +
      preferenceMatch * 0.3 +
      bmiSuitability * 0.3
    );

    // Check if user has actual height/weight data
    const hasUserData = userProfile.height !== 170 || userProfile.weight !== 65;

    // Generate reason for suggestion
    const reason = this.generateSuggestionReason(nutritionalMatch, preferenceMatch, bmiSuitability, userProfile.bmi, hasUserData);

    return {
      mealId: meal.id,
      name: meal.nameEnglish,
      score: Math.round(score * 100) / 100,
      reason,
      nutritionalMatch: Math.round(nutritionalMatch * 100) / 100,
      preferenceMatch: Math.round(preferenceMatch * 100) / 100,
      bmiSuitability: Math.round(bmiSuitability * 100) / 100,
    };
  }

  /**
   * Calculate nutritional information from meal ingredients
   */
  private calculateNutritionalInfo(ingredients: any[]): NutritionalInfo {
    // Basic nutritional estimates based on ingredient types
    // This is a simplified calculation - in a real system, you'd have a nutritional database
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let fiber = 0;
    let calories = 0;

    ingredients.forEach(mealIngredient => {
      const ingredient = mealIngredient.ingredient;
      const ingredientType = ingredient.type?.toLowerCase() || '';

      // Basic nutritional estimates per 100g
      if (ingredientType.includes('protein') || ingredientType.includes('meat') || ingredientType.includes('fish')) {
        protein += 20;
        calories += 150;
        fats += 5;
      } else if (ingredientType.includes('carb') || ingredientType.includes('rice') || ingredientType.includes('bread')) {
        carbs += 25;
        calories += 130;
        fiber += 2;
      } else if (ingredientType.includes('vegetable') || ingredientType.includes('veg')) {
        fiber += 3;
        calories += 25;
        carbs += 5;
      } else if (ingredientType.includes('dairy') || ingredientType.includes('milk')) {
        protein += 8;
        fats += 3;
        calories += 60;
      } else {
        // Default values for unclassified ingredients
        calories += 50;
        carbs += 10;
        protein += 5;
      }
    });

    return { protein, carbs, fats, fiber, calories };
  }

  /**
   * Calculate how well the meal's nutrition matches the user's BMI needs
   */
  private calculateNutritionalMatch(nutritionalInfo: NutritionalInfo, bmi: number): number {
    let score = 0.5; // Base score

    if (bmi < 18.5) {
      // Underweight - needs more calories and protein
      score += (nutritionalInfo.calories / 200) * 0.3;
      score += (nutritionalInfo.protein / 25) * 0.2;
    } else if (bmi >= 18.5 && bmi < 25) {
      // Normal weight - balanced nutrition
      const balanceScore = 1 - Math.abs(0.3 - (nutritionalInfo.protein / (nutritionalInfo.protein + nutritionalInfo.carbs + nutritionalInfo.fats)));
      score += balanceScore * 0.3;
      score += (nutritionalInfo.fiber / 10) * 0.2;
    } else if (bmi >= 25 && bmi < 30) {
      // Overweight - lower calories, higher fiber
      score += Math.max(0, (1 - nutritionalInfo.calories / 300)) * 0.3;
      score += (nutritionalInfo.fiber / 15) * 0.2;
    } else {
      // Obese - very low calories, high fiber, high protein
      score += Math.max(0, (1 - nutritionalInfo.calories / 250)) * 0.4;
      score += (nutritionalInfo.fiber / 20) * 0.3;
      score += (nutritionalInfo.protein / 30) * 0.2;
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate preference match based on order history
   */
  private calculatePreferenceMatch(mealId: number, preferredMeals: number[]): number {
    if (preferredMeals.length === 0) {
      return 0.5; // Neutral score if no preferences
    }

    const preferenceIndex = preferredMeals.indexOf(mealId);
    if (preferenceIndex === -1) {
      return 0.3; // Lower score for non-preferred meals
    }

    // Higher score for more frequently ordered meals
    return 1 - (preferenceIndex / preferredMeals.length) * 0.5;
  }

  /**
   * Calculate BMI suitability score
   */
  private calculateBMISuitability(nutritionalInfo: NutritionalInfo, bmi: number): number {
    const calorieRatio = nutritionalInfo.calories / 300; // Normalize to 300 calories

    if (bmi < 18.5) {
      // Underweight - higher calories are better
      return Math.min(1, calorieRatio);
    } else if (bmi >= 18.5 && bmi < 25) {
      // Normal weight - moderate calories
      return 1 - Math.abs(calorieRatio - 0.7) / 0.7;
    } else {
      // Overweight/Obese - lower calories are better
      return Math.max(0, 1 - calorieRatio);
    }
  }

  /**
   * Generate human-readable reason for suggestion
   */
  private generateSuggestionReason(
    nutritionalMatch: number,
    preferenceMatch: number,
    bmiSuitability: number,
    bmi: number,
    hasUserData: boolean = true,
  ): string {
    const reasons = [];

    if (preferenceMatch > 0.7) {
      reasons.push("frequently ordered by you");
    } else if (preferenceMatch > 0.5) {
      reasons.push("similar to your previous choices");
    }

    if (!hasUserData) {
      reasons.push("balanced nutrition (add height/weight for personalized suggestions)");
    } else if (bmi < 18.5) {
      if (bmiSuitability > 0.7) {
        reasons.push("good for healthy weight gain");
      }
    } else if (bmi >= 18.5 && bmi < 25) {
      if (nutritionalMatch > 0.7) {
        reasons.push("well-balanced nutrition");
      }
    } else if (bmi >= 25 && bmi < 30) {
      if (bmiSuitability > 0.7) {
        reasons.push("supports weight management");
      }
    } else {
      if (bmiSuitability > 0.7) {
        reasons.push("low-calorie, high-nutrition option");
      }
    }

    if (nutritionalMatch > 0.8) {
      reasons.push("excellent nutritional profile");
    } else if (nutritionalMatch > 0.6) {
      reasons.push("good nutritional content");
    }

    return reasons.length > 0 
      ? `Recommended because it's ${reasons.join(" and ")}.`
      : "A balanced meal option for you.";
  }
}
