import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MealsServingService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Existing methods: findMealsServingByMealId, findOrdersByDate, getMealOrderCountsByDate ...

  // Retrieve a meal by its ID with related ingredients
  async findMealsServingByMealId(id: number) {
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found');
      }

      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal: ${error.message}`);
    }
  }

  // Retrieve orders by a specific date
  async findOrdersByDate(orderDate: Date) {
    try {
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      const orders = await this.databaseService.order.findMany({
        where: {
          orderDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      const ordersWithMeals = await Promise.all(
        orders.map(async (order) => {
          const mealDetails = await Promise.all(
            order.meals.map(async (mealEntry) => {
              const [mealId, count] = mealEntry.split(':').map((value) => Number(value));
              const meal = await this.databaseService.meal.findUnique({ where: { id: mealId } });
              return { ...meal, count };
            })
          );
          return { ...order, mealDetails };
        })
      );

      return ordersWithMeals;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve orders: ${error.message}`);
    }
  }

  // Get total count of each meal ordered on a specific date
  async getMealOrderCountsByDate(orderDate: Date) {
    try {
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      const orders = await this.databaseService.order.findMany({
        where: {
          orderDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      const mealCounts: { [mealId: number]: { name: string; totalCount: number } } = {};

      for (const order of orders) {
        for (const mealEntry of order.meals) {
          const [mealIdStr, countStr] = mealEntry.split(':');
          const mealId = Number(mealIdStr);
          const count = Number(countStr);

          if (isNaN(mealId) || isNaN(count)) {
            throw new BadRequestException(`Invalid meal entry format: ${mealEntry}`);
          }

          if (!mealCounts[mealId]) {
            const meal = await this.databaseService.meal.findUnique({
              where: { id: mealId },
              select: { id: true, nameEnglish: true },
            });

            if (!meal) {
              throw new NotFoundException(`Meal with ID ${mealId} not found`);
            }

            mealCounts[mealId] = { name: meal.nameEnglish, totalCount: 0 };
          }

          mealCounts[mealId].totalCount += count;
        }
      }

      const result = Object.entries(mealCounts).map(([mealId, { name, totalCount }]) => ({
        mealId: Number(mealId),
        name,
        totalCount,
      }));

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal counts: ${error.message}`);
    }
  }

  // New method to get meal counts allocated by meal time (breakfast, lunch, dinner)
  async getMealCountsByMealTime(orderDate: Date) {
    try {
      // Calculate the start and end of the day
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Query orders within the date range
      const orders = await this.databaseService.order.findMany({
        where: {
          orderDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      // Initialize meal counts for each meal time
      const mealCounts: {
        breakfast: { [mealId: number]: { name: string; totalCount: number } };
        lunch: { [mealId: number]: { name: string; totalCount: number } };
        dinner: { [mealId: number]: { name: string; totalCount: number } };
      } = {
        breakfast: {},
        lunch: {},
        dinner: {},
      };

      // Process each order
      for (const order of orders) {
        for (const mealEntry of order.meals) {
          const [mealIdStr, countStr] = mealEntry.split(':');
          const mealId = Number(mealIdStr);
          const count = Number(countStr);

          if (isNaN(mealId) || isNaN(count)) {
            throw new BadRequestException(`Invalid meal entry format: ${mealEntry}`);
          }

          // Fetch meal details if not already cached
          const meal = await this.databaseService.meal.findUnique({
            where: { id: mealId },
            select: { id: true, nameEnglish: true },
          });

          if (!meal) {
            throw new NotFoundException(`Meal with ID ${mealId} not found`);
          }

          // Allocate counts based on meal time flags
          if (order.breakfast && !mealCounts.breakfast[mealId]) {
            mealCounts.breakfast[mealId] = { name: meal.nameEnglish, totalCount: 0 };
          }
          if (order.lunch && !mealCounts.lunch[mealId]) {
            mealCounts.lunch[mealId] = { name: meal.nameEnglish, totalCount: 0 };
          }
          if (order.dinner && !mealCounts.dinner[mealId]) {
            mealCounts.dinner[mealId] = { name: meal.nameEnglish, totalCount: 0 };
          }

          // Add counts to respective meal times
          if (order.breakfast) {
            mealCounts.breakfast[mealId].totalCount += count;
          }
          if (order.lunch) {
            mealCounts.lunch[mealId].totalCount += count;
          }
          if (order.dinner) {
            mealCounts.dinner[mealId].totalCount += count;
          }
        }
      }

      // Format the response
      const formatCounts = (counts: { [mealId: number]: { name: string; totalCount: number } }) =>
        Object.entries(counts).map(([mealId, { name, totalCount }]) => ({
          mealId: Number(mealId),
          name,
          totalCount,
        }));

      return {
        breakfast: formatCounts(mealCounts.breakfast),
        lunch: formatCounts(mealCounts.lunch),
        dinner: formatCounts(mealCounts.dinner),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal counts by meal time: ${error.message}`);
    }
  }
}