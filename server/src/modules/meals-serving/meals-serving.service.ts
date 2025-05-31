import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

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
              const [mealId, count] = mealEntry.split(':').map((value) => Number(value));// Split the meal entry into ID and count
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

  // New method to get meal counts allocated by meal time (dynamic)
  async getMealCountsByMealTime(orderDate: Date) {
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
        // Remove the include if the relation does not exist in your Prisma schema
        // and instead join or fetch mealType separately if needed
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      // Dynamic meal counts object
      const mealCounts: {
        [mealTypeName: string]: { 
          [mealId: number]: { 
            name: string; 
            totalCount: number; 
            imageUrl: string | null;
            mealTypeId: number;
          } 
        };
      } = {};

      for (const order of orders) {
        // Fetch meal type name using mealTypeId
        let mealTypeName = 'unknown';
        let mealTypeId = order.mealTypeId;
        if (mealTypeId !== undefined && mealTypeId !== null) {
          const mealType = await this.databaseService.mealType.findUnique({
            where: { id: mealTypeId },
            select: { name: true },
          });
          if (mealType && mealType.name) {
            mealTypeName = mealType.name.toLowerCase();
          }
        }
        
        // Initialize meal type if not exists
        if (!mealCounts[mealTypeName]) {
          mealCounts[mealTypeName] = {};
        }

        for (const mealEntry of order.meals) {
          const [mealIdStr, countStr] = mealEntry.split(':');
          const mealId = Number(mealIdStr);
          const count = Number(countStr);

          if (isNaN(mealId) || isNaN(count)) {
            throw new BadRequestException(`Invalid meal entry format: ${mealEntry}`);
          }

          const meal = await this.databaseService.meal.findUnique({
            where: { id: mealId },
            select: { id: true, nameEnglish: true, imageUrl: true },
          });

          if (!meal) {
            throw new NotFoundException(`Meal with ID ${mealId} not found`);
          }

          // Initialize meal in this meal type if not exists
          if (!mealCounts[mealTypeName][mealId]) {
            mealCounts[mealTypeName][mealId] = { 
              name: meal.nameEnglish, 
              totalCount: 0, 
              imageUrl: meal.imageUrl,
              mealTypeId: order.mealTypeId
            };
          }

          mealCounts[mealTypeName][mealId].totalCount += count;
        }
      }

      // Format the result
      const result: {
        [mealTypeName: string]: Array<{
          mealId: number;
          name: string;
          totalCount: number;
          imageUrl: string | null;
          mealTypeId: number;
        }>;
      } = {};

      for (const [mealTypeName, meals] of Object.entries(mealCounts)) {
        result[mealTypeName] = Object.entries(meals).map(([mealId, { name, totalCount, imageUrl, mealTypeId }]) => ({
          mealId: Number(mealId),
          name,
          totalCount,
          imageUrl,
          mealTypeId,
        }));
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal counts by meal time: ${error.message}`);
    }
  }
}