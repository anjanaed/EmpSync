import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface NutritionalInfo {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  sodium?: number;
  sugar?: number;
  vitamins?: number;
}

interface UserProfile {
  id: string;
  height: number;
  weight: number;
  bmi: number;
  age?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  preferredMeals: number[];
  orderHistory: any[];
  dietaryRestrictions?: string[];
  allergens?: string[];
  recentOrderPatterns: {
    timeOfDay: string[];
    weekDay: number[];
    seasonality: string[];
  };
  collaborativeSignals: {
    similarUsers: string[];
    popularInOrg: number[];
  };
}

interface MealSuggestion {
  mealId: number;
  name: string;
  score: number;
  confidence: number;
  reason: string;
  nutritionalMatch: number;
  preferenceMatch: number;
  bmiSuitability: number;
  collaborativeScore: number;
  diversityBonus: number;
  freshnessScore: number;
  contextualRelevance: number;
}

@Injectable()
export class MealSuggestionService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get meal suggestions for a user based on BMI, preferences, and nutritional content
   * Using industry-standard recommendation techniques
   */
  async getMealSuggestions(
    userId: string,
    date: string,
    mealTypeId: number,
    orgId?: string,
  ): Promise<MealSuggestion[]> {
    try {
      // Get user profile with enhanced data
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

      // Industry-standard post-processing
      const processedSuggestions = this.postProcessSuggestions(suggestions, userProfile);

      // Sort by score (highest first) and return top suggestions
      return processedSuggestions
        .sort((a, b) => {
          // Primary sort by score
          if (Math.abs(b.score - a.score) > 0.05) {
            return b.score - a.score;
          }
          // Secondary sort by confidence for similar scores
          return b.confidence - a.confidence;
        })
        .slice(0, Math.min(5, processedSuggestions.length)); // Return top 5 suggestions

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

    // Analyze ordering patterns for contextual recommendations
    const recentOrderPatterns = this.analyzeOrderPatterns(orderHistory);
    
    // Get collaborative filtering signals
    const collaborativeSignals = await this.getCollaborativeSignals(userId, user.organizationId, preferredMeals);

    return {
      id: userId,
      height: user.height || 170, // Default height in cm
      weight: user.weight || 65,  // Default weight in kg
      bmi,
      preferredMeals,
      orderHistory,
      recentOrderPatterns,
      collaborativeSignals,
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
   * Calculate meal score based on user profile using industry-standard recommendation techniques
   */
  private async calculateMealScore(meal: any, userProfile: UserProfile): Promise<MealSuggestion> {
    // Calculate nutritional information from ingredients
    const nutritionalInfo = this.calculateNutritionalInfo(meal.ingredients);
    
    // Calculate different scoring factors
    const nutritionalMatch = this.calculateNutritionalMatch(nutritionalInfo, userProfile.bmi);
    const preferenceMatch = this.calculatePreferenceMatch(meal.id, userProfile.preferredMeals);
    const bmiSuitability = this.calculateBMISuitability(nutritionalInfo, userProfile.bmi);
    
    // Industry-standard recommendation factors
    const collaborativeScore = this.calculateCollaborativeScore(meal.id, userProfile.collaborativeSignals);
    const diversityBonus = this.calculateDiversityBonus(meal.id, userProfile.orderHistory);
    const freshnessScore = this.calculateFreshnessScore(meal.id, userProfile.orderHistory);
    const contextualRelevance = this.calculateContextualRelevance(meal, userProfile.recentOrderPatterns);
    
    // Enhanced weighted scoring with multiple factors
    const score = (
      nutritionalMatch * 0.25 +
      preferenceMatch * 0.20 +
      bmiSuitability * 0.20 +
      collaborativeScore * 0.15 +
      diversityBonus * 0.10 +
      freshnessScore * 0.05 +
      contextualRelevance * 0.05
    );

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(userProfile, nutritionalInfo);

    // Check if user has actual height/weight data
    const hasUserData = userProfile.height !== 170 || userProfile.weight !== 65;

    // Generate enhanced reason for suggestion
    const reason = this.generateEnhancedSuggestionReason(
      nutritionalMatch, 
      preferenceMatch, 
      bmiSuitability, 
      collaborativeScore,
      userProfile.bmi, 
      hasUserData
    );

    return {
      mealId: meal.id,
      name: meal.nameEnglish,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      reason,
      nutritionalMatch: Math.round(nutritionalMatch * 100) / 100,
      preferenceMatch: Math.round(preferenceMatch * 100) / 100,
      bmiSuitability: Math.round(bmiSuitability * 100) / 100,
      collaborativeScore: Math.round(collaborativeScore * 100) / 100,
      diversityBonus: Math.round(diversityBonus * 100) / 100,
      freshnessScore: Math.round(freshnessScore * 100) / 100,
      contextualRelevance: Math.round(contextualRelevance * 100) / 100,
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

  // ===== INDUSTRY-STANDARD RECOMMENDATION SYSTEM METHODS =====

  /**
   * Post-process suggestions with industry-standard techniques
   */
  private postProcessSuggestions(suggestions: MealSuggestion[], userProfile: UserProfile): MealSuggestion[] {
    // Apply re-ranking based on business rules
    let processed = suggestions.map(suggestion => {
      let adjustedScore = suggestion.score;

      // Boost score for high-confidence recommendations
      if (suggestion.confidence > 0.8) {
        adjustedScore *= 1.05;
      }

      // Apply diversity enforcement - penalize too many similar meals
      const diversityPenalty = this.calculateDiversityPenalty(suggestion, suggestions);
      adjustedScore *= (1 - diversityPenalty);

      // Apply temporal relevance boost
      const temporalBoost = this.calculateTemporalBoost(suggestion);
      adjustedScore *= (1 + temporalBoost);

      return {
        ...suggestion,
        score: Math.min(1, Math.max(0, adjustedScore))
      };
    });

    // Ensure diversity in final recommendations
    processed = this.ensureDiversity(processed);

    return processed;
  }

  /**
   * Calculate diversity penalty to avoid recommending too many similar meals
   */
  private calculateDiversityPenalty(suggestion: MealSuggestion, allSuggestions: MealSuggestion[]): number {
    // Simple diversity check - in production, you'd use ingredient similarity, cuisine type, etc.
    const topSuggestions = allSuggestions
      .filter(s => s.score > suggestion.score)
      .slice(0, 3);

    // If this suggestion is very similar to higher-scored ones, apply penalty
    // This is a simplified version - you'd implement proper similarity metrics
    const similarCount = topSuggestions.filter(s => 
      Math.abs(s.nutritionalMatch - suggestion.nutritionalMatch) < 0.1 &&
      Math.abs(s.bmiSuitability - suggestion.bmiSuitability) < 0.1
    ).length;

    return Math.min(0.3, similarCount * 0.1); // Max 30% penalty
  }

  /**
   * Calculate temporal relevance boost based on current time/context
   */
  private calculateTemporalBoost(suggestion: MealSuggestion): number {
    const currentHour = new Date().getHours();
    
    // Simple time-based boost - you could expand this with more context
    if (currentHour >= 11 && currentHour < 15) {
      // Lunch time - boost lighter meals
      if (suggestion.nutritionalMatch > 0.7) return 0.05;
    } else if (currentHour >= 18 && currentHour < 21) {
      // Dinner time - boost more substantial meals
      if (suggestion.bmiSuitability > 0.6) return 0.05;
    }

    return 0;
  }

  /**
   * Ensure diversity in final recommendations
   */
  private ensureDiversity(suggestions: MealSuggestion[]): MealSuggestion[] {
    const diverseSuggestions: MealSuggestion[] = [];
    const usedCategories = new Set<string>();

    for (const suggestion of suggestions.sort((a, b) => b.score - a.score)) {
      // Simple categorization based on nutritional profile
      const category = this.categorizeMeal(suggestion);
      
      // Add suggestion if category not already represented or if it's much better
      if (!usedCategories.has(category) || 
          diverseSuggestions.length < 3 || 
          suggestion.score > diverseSuggestions[diverseSuggestions.length - 1].score + 0.1) {
        
        diverseSuggestions.push(suggestion);
        usedCategories.add(category);
      }

      if (diverseSuggestions.length >= 5) break;
    }

    return diverseSuggestions;
  }

  /**
   * Categorize meal based on nutritional profile
   */
  private categorizeMeal(suggestion: MealSuggestion): string {
    // Simple categorization - you could expand this with actual ingredient data
    if (suggestion.nutritionalMatch > 0.8) return 'high-nutrition';
    if (suggestion.bmiSuitability > 0.8) return 'health-focused';
    if (suggestion.preferenceMatch > 0.7) return 'personal-favorite';
    if (suggestion.collaborativeScore > 0.7) return 'popular-choice';
    return 'balanced';
  }

  /**
   * Analyze user's ordering patterns for contextual recommendations
   */
  private analyzeOrderPatterns(orderHistory: any[]): {
    timeOfDay: string[];
    weekDay: number[];
    seasonality: string[];
  } {
    const timePatterns: string[] = [];
    const weekDayPatterns: number[] = [];
    const seasonalityPatterns: string[] = [];

    orderHistory.forEach(order => {
      const orderTime = new Date(order.orderPlacedTime);
      const hour = orderTime.getHours();
      const weekDay = orderTime.getDay();
      const month = orderTime.getMonth();

      // Time of day patterns
      if (hour >= 6 && hour < 11) timePatterns.push('breakfast');
      else if (hour >= 11 && hour < 15) timePatterns.push('lunch');
      else if (hour >= 15 && hour < 18) timePatterns.push('snack');
      else if (hour >= 18 && hour < 22) timePatterns.push('dinner');

      // Week day patterns
      weekDayPatterns.push(weekDay);

      // Seasonal patterns
      if (month >= 2 && month <= 4) seasonalityPatterns.push('spring');
      else if (month >= 5 && month <= 7) seasonalityPatterns.push('summer');
      else if (month >= 8 && month <= 10) seasonalityPatterns.push('fall');
      else seasonalityPatterns.push('winter');
    });

    return {
      timeOfDay: this.getMostFrequent(timePatterns),
      weekDay: this.getMostFrequent(weekDayPatterns),
      seasonality: this.getMostFrequent(seasonalityPatterns),
    };
  }

  /**
   * Get collaborative filtering signals (similar users and popular meals)
   */
  private async getCollaborativeSignals(
    userId: string, 
    organizationId: string, 
    preferredMeals: number[]
  ): Promise<{ similarUsers: string[]; popularInOrg: number[]; }> {
    try {
      // Find users with similar meal preferences in the same organization
      const similarUsers = await this.findSimilarUsers(userId, organizationId, preferredMeals);
      
      // Get popular meals in the organization
      const popularInOrg = await this.getPopularMealsInOrg(organizationId);

      return { similarUsers, popularInOrg };
    } catch (error) {
      // Fallback to empty arrays if collaborative filtering fails
      return { similarUsers: [], popularInOrg: [] };
    }
  }

  /**
   * Calculate collaborative filtering score based on similar users' preferences
   */
  private calculateCollaborativeScore(mealId: number, collaborativeSignals: any): number {
    let score = 0.5; // Base neutral score

    // Boost score if meal is popular in organization
    if (collaborativeSignals.popularInOrg.includes(mealId)) {
      const popularityIndex = collaborativeSignals.popularInOrg.indexOf(mealId);
      score += (1 - popularityIndex / collaborativeSignals.popularInOrg.length) * 0.3;
    }

    // Additional boost if similar users like this meal
    if (collaborativeSignals.similarUsers.length > 0) {
      score += 0.2; // Implicit boost for having similar user data
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate diversity bonus to avoid recommendation monotony
   */
  private calculateDiversityBonus(mealId: number, orderHistory: any[]): number {
    const recentMealIds = orderHistory
      .slice(-10) // Last 10 orders
      .flatMap(order => order.meals.map(meal => parseInt(meal.split(':')[0])))
      .filter(id => !isNaN(id));

    const mealCount = recentMealIds.filter(id => id === mealId).length;
    
    // Higher diversity bonus for meals not recently ordered
    if (mealCount === 0) return 1.0; // Never ordered recently
    if (mealCount === 1) return 0.7; // Ordered once recently
    if (mealCount === 2) return 0.4; // Ordered twice recently
    return 0.1; // Ordered frequently recently (low diversity)
  }

  /**
   * Calculate freshness score to introduce new meals
   */
  private calculateFreshnessScore(mealId: number, orderHistory: any[]): number {
    const allOrderedMeals = orderHistory
      .flatMap(order => order.meals.map(meal => parseInt(meal.split(':')[0])))
      .filter(id => !isNaN(id));

    const hasOrderedBefore = allOrderedMeals.includes(mealId);
    
    // Slight boost for new meals to encourage exploration
    return hasOrderedBefore ? 0.5 : 0.8;
  }

  /**
   * Calculate contextual relevance based on time, season, etc.
   */
  private calculateContextualRelevance(meal: any, orderPatterns: any): number {
    let score = 0.5; // Base score

    const currentHour = new Date().getHours();
    const currentWeekDay = new Date().getDay();
    const currentMonth = new Date().getMonth();

    // Time-based relevance
    let currentTimeOfDay = 'other';
    if (currentHour >= 6 && currentHour < 11) currentTimeOfDay = 'breakfast';
    else if (currentHour >= 11 && currentHour < 15) currentTimeOfDay = 'lunch';
    else if (currentHour >= 15 && currentHour < 18) currentTimeOfDay = 'snack';
    else if (currentHour >= 18 && currentHour < 22) currentTimeOfDay = 'dinner';

    if (orderPatterns.timeOfDay.includes(currentTimeOfDay)) {
      score += 0.3;
    }

    // Week day relevance
    if (orderPatterns.weekDay.includes(currentWeekDay)) {
      score += 0.2;
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidence(userProfile: UserProfile, nutritionalInfo: NutritionalInfo): number {
    let confidence = 0.3; // Base confidence

    // Increase confidence based on available user data
    if (userProfile.height !== 170 && userProfile.weight !== 65) confidence += 0.2;
    if (userProfile.orderHistory.length > 5) confidence += 0.2;
    if (userProfile.preferredMeals.length > 0) confidence += 0.2;
    if (userProfile.collaborativeSignals.similarUsers.length > 0) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Generate enhanced reason with collaborative and contextual insights
   */
  private generateEnhancedSuggestionReason(
    nutritionalMatch: number,
    preferenceMatch: number,
    bmiSuitability: number,
    collaborativeScore: number,
    bmi: number,
    hasUserData: boolean = true,
  ): string {
    const reasons = [];

    // Personal preference reasons
    if (preferenceMatch > 0.7) {
      reasons.push("frequently ordered by you");
    } else if (preferenceMatch > 0.5) {
      reasons.push("similar to your previous choices");
    }

    // Collaborative reasons
    if (collaborativeScore > 0.7) {
      reasons.push("popular with similar users");
    } else if (collaborativeScore > 0.6) {
      reasons.push("trending in your organization");
    }

    // Health-based reasons
    if (!hasUserData) {
      reasons.push("balanced nutrition (add height/weight for personalized suggestions)");
    } else if (bmi < 18.5) {
      if (bmiSuitability > 0.7) {
        reasons.push("supports healthy weight gain");
      }
    } else if (bmi >= 18.5 && bmi < 25) {
      if (nutritionalMatch > 0.7) {
        reasons.push("matches your nutritional needs");
      }
    } else if (bmi >= 25 && bmi < 30) {
      if (bmiSuitability > 0.7) {
        reasons.push("supports your wellness goals");
      }
    } else {
      if (bmiSuitability > 0.7) {
        reasons.push("optimized for your health profile");
      }
    }

    // Nutritional quality reasons
    if (nutritionalMatch > 0.8) {
      reasons.push("excellent nutritional profile");
    } else if (nutritionalMatch > 0.6) {
      reasons.push("good nutritional balance");
    }

    return reasons.length > 0 
      ? `Recommended because it's ${reasons.join(" and ")}.`
      : "A great meal option for you.";
  }

  // ===== HELPER METHODS =====

  /**
   * Find most frequent items in an array
   */
  private getMostFrequent<T>(arr: T[]): T[] {
    const frequency: { [key: string]: number } = {};
    arr.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    const sorted = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 most frequent
      .map(([key, _]) => {
        // Convert back to original type
        const num = Number(key);
        return isNaN(num) ? key as T : num as T;
      });

    return sorted;
  }

  /**
   * Find users with similar meal preferences
   */
  private async findSimilarUsers(
    userId: string, 
    organizationId: string, 
    preferredMeals: number[]
  ): Promise<string[]> {
    if (preferredMeals.length === 0) return [];

    try {
      // Get other users in the same organization with order history
      const orgUsers = await this.databaseService.user.findMany({
        where: {
          organizationId: organizationId,
          id: { not: userId }
        },
        select: {
          id: true
        },
        take: 50 // Limit for performance
      });

      // Simplified similarity calculation - in production, you'd use more sophisticated algorithms
      const similarUsers: string[] = [];
      
      for (const user of orgUsers.slice(0, 10)) { // Check first 10 users for performance
        const userOrders = await this.databaseService.order.findMany({
          where: { employeeId: user.id },
          select: { meals: true },
          take: 20
        });

        const userMeals = userOrders
          .flatMap(order => order.meals.map(meal => parseInt(meal.split(':')[0])))
          .filter(id => !isNaN(id));

        // Calculate Jaccard similarity
        const intersection = preferredMeals.filter(meal => userMeals.includes(meal));
        const union = [...new Set([...preferredMeals, ...userMeals])];
        const similarity = intersection.length / union.length;

        if (similarity > 0.3) { // 30% similarity threshold
          similarUsers.push(user.id);
        }
      }

      return similarUsers.slice(0, 5); // Return top 5 similar users
    } catch (error) {
      return [];
    }
  }

  /**
   * Get popular meals in the organization
   */
  private async getPopularMealsInOrg(organizationId: string): Promise<number[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // First get users in the organization
      const orgUsers = await this.databaseService.user.findMany({
        where: { organizationId: organizationId },
        select: { id: true }
      });

      const userIds = orgUsers.map(user => user.id);

      const orgOrders = await this.databaseService.order.findMany({
        where: {
          employeeId: {
            in: userIds
          },
          orderPlacedTime: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          meals: true
        },
        take: 1000 // Limit for performance
      });

      const mealFrequency: { [key: number]: number } = {};
      
      orgOrders.forEach(order => {
        order.meals.forEach(mealEntry => {
          const mealId = parseInt(mealEntry.split(':')[0]);
          const count = parseInt(mealEntry.split(':')[1]);
          
          if (!isNaN(mealId) && !isNaN(count)) {
            mealFrequency[mealId] = (mealFrequency[mealId] || 0) + count;
          }
        });
      });

      return Object.entries(mealFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 popular meals
        .map(([mealId]) => parseInt(mealId));

    } catch (error) {
      return [];
    }
  }
}
