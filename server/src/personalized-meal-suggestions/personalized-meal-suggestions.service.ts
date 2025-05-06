import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { subDays } from 'date-fns';

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

    const categoryCounts: Record<string, number> = {};
    for (const order of pastOrders) {
      for (const mealId of order.meals) {
        const numericMealId = parseInt(mealId, 10); // Convert mealId to a number
        if (isNaN(numericMealId)) {
          console.warn(`Invalid mealId: ${mealId}`);
          continue;
        }

        const meal = await this.databaseService.meal.findUnique({
          where: { id: numericMealId },
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
      .sort((a, b) => b[1] - a[1]) // Ensure numeric comparison
      .slice(0, 3)
      .map(([category]) => category);
  }

  // AI-driven meal suggestion logic
  async getPersonalizedSuggestions(userId: string): Promise<any[]> {
    // Fetch user data
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`User with ID ${userId} not found.`);
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Log the raw user data to the console
    console.log('Raw user data:', user);

    if (!user.height || !user.weight) {
      console.warn(`Incomplete user data for user ID ${userId}.`);
      throw new Error(`Incomplete user data for user ID ${userId}.`);
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
      console.warn(`No scheduled meals found for date: ${today}`);
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

  async getPersonalizedSuggestionsForDate(userId: string, date: Date): Promise<any[]> {
    try {
      console.log('User ID:', userId);
      console.log('Date:', date);

      const parsedDate = new Date(date);
      console.log('Parsed Date:', parsedDate);
      if (isNaN(parsedDate.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      // Fetch user data
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(`User with ID ${userId} not found.`, HttpStatus.NOT_FOUND);
      }

      if (!user.height || !user.weight) {
        throw new HttpException(
          `Incomplete user data for user ID ${userId}. Height and weight are required.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate age from dob (assuming dob is a string like 'YYYY-MM-DD')
      const age = user.dob
        ? Math.floor(
            (new Date().getTime() - new Date(user.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
          )
        : 30; // Default age if not provided

      // Calculate caloric needs
      const caloricNeeds = this.calculateCaloricNeeds(
        user.height,
        user.weight,
        age,
        user.gender || 'male', // Default gender if not provided
      );

      // Get user's preferred meal categories based on past orders
      const preferredCategories = await this.getUserPreferences(userId);

      // Normalize the date to remove time components
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Fetch scheduled meals for the given date
      const scheduledMeals = await this.databaseService.scheduledMeal.findUnique({
        where: {
          date: normalizedDate,
        },
        select: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
      });

      if (!scheduledMeals) {
        throw new HttpException('No meals scheduled for the given date', HttpStatus.NOT_FOUND);
      }

      // Combine all meal IDs for the date
      const mealIds = [
        ...scheduledMeals.breakfast,
        ...scheduledMeals.lunch,
        ...scheduledMeals.dinner,
      ];

      // Fetch meal details
      const meals = await this.databaseService.meal.findMany({
        where: { id: { in: mealIds } },
      });

      // Filter meals based on user preferences and caloric needs
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

      // Map the suggestions to a user-friendly format
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
    } catch (err) {
      console.error('Error in getPersonalizedSuggestionsForDate:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOrdersByUserId(userId: string) {
    try {
      const orders = await this.databaseService.order.findMany({
        where: {
          employeeId: userId, // Ensure this matches the database schema
        },
      });
  
      if (orders.length > 0) {
        return orders;
      } else {
        throw new HttpException('No Orders Found for this User', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      console.error('Error fetching orders by userId:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUsersByUserId(userId: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id: userId, // Ensure this matches the database schema
        },
        include: {
          payrolls: true, // Include related payrolls
          attendance: true, // Include related attendance
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (err) {
      console.error('Error fetching user by userId:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findMealsByMealId(id: number) {
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: {
          id: Number(id), // Ensure the id is passed as an Int
        },
        include: {
          ingredients: {
            include: {
              ingredient: true, // Include related ingredient details
            },
          },
        },
      });

      if (!meal) {
        throw new HttpException('Meal not found', HttpStatus.NOT_FOUND);
      }

      return meal;
    } catch (err) {
      console.error('Error fetching meal by id:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findMealsByScheduledDate(date: Date) {
    try {
      // Ensure the date is normalized to remove time components
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const scheduledMeal = await this.databaseService.scheduledMeal.findUnique({
        where: {
          date: normalizedDate, // Match the date in the database
        },
        select: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
      });

      if (!scheduledMeal) {
        throw new HttpException('No meals scheduled for the given date', HttpStatus.NOT_FOUND);
      }

      return scheduledMeal; // Return the meal IDs for breakfast, lunch, and dinner
    } catch (err) {
      console.error('Error fetching meals by scheduled date:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableMeals(userId: string): Promise<any> {
    try {
      // Retrieve user details (height, weight, etc.)
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        select: {
          height: true,
          weight: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (!user.height || !user.weight) {
        throw new HttpException(
          'Incomplete user data. Height and weight are required.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Retrieve user's previous orders
      const thirtyDaysAgo = subDays(new Date(), 30);
      const previousOrders = await this.databaseService.order.findMany({
        where: {
          employeeId: userId,
          orderDate: { gte: thirtyDaysAgo },
        },
        select: {
          meals: true,
        },
      });

      // Flatten meal IDs from previous orders
      const previousMealIds = previousOrders.flatMap((order) => order.meals);

      // Get today's date and time
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Retrieve scheduled meals for today
      const scheduledMeals = await this.databaseService.scheduledMeal.findUnique({
        where: { date: today },
        select: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
      });

      if (!scheduledMeals) {
        throw new HttpException('No meals scheduled for today', HttpStatus.NOT_FOUND);
      }

      // Determine the current meal time (breakfast, lunch, or dinner)
      let currentMealIds: number[] = [];
      const currentHour = now.getHours();
      if (currentHour >= 6 && currentHour < 11) {
        currentMealIds = scheduledMeals.breakfast;
      } else if (currentHour >= 11 && currentHour < 16) {
        currentMealIds = scheduledMeals.lunch;
      } else if (currentHour >= 16 && currentHour < 22) {
        currentMealIds = scheduledMeals.dinner;
      } else {
        throw new HttpException('No meals available at this time', HttpStatus.NOT_FOUND);
      }

      // Fetch meal details for the current meal IDs
      const meals = await this.databaseService.meal.findMany({
        where: { id: { in: currentMealIds } },
        select: { nameEnglish: true },
      });

      // Extract meal English names
      const availableMealNames = meals.map((meal) => meal.nameEnglish);

      // Return the available meal names
      return {
        user: {
          height: user.height,
          weight: user.weight,
        },
        previousMealIds,
        availableMealNames,
      };
    } catch (err) {
      console.error('Error fetching available meals:', err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}