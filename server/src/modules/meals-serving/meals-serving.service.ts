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
  async findOrdersByDate(orderDate: Date, orgId?: string) {
    try {
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      const whereCondition: any = {
        orderDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      // Add organization filter if provided
      if (orgId) {
        whereCondition.orgId = orgId;
      }

      const orders = await this.databaseService.order.findMany({
        where: whereCondition,
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
  async getMealOrderCountsByDate(orderDate: Date, orgId?: string) {
    try {
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      const whereCondition: any = {
        orderDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      // Add organization filter if provided
      if (orgId) {
        whereCondition.orgId = orgId;
      }

      const orders = await this.databaseService.order.findMany({
        where: whereCondition,
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

  // Optimized method to get meal counts allocated by meal time (dynamic)
  async getMealCountsByMealTime(orderDate: Date, orgId?: string) {
    try {
      const startOfDay = new Date(orderDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(orderDate);
      endOfDay.setHours(23, 59, 59, 999);

      const whereCondition: any = {
        orderDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      // Add organization filter if provided
      if (orgId) {
        whereCondition.orgId = orgId;
      }

      // Fetch orders, meal types, and meals in parallel for better performance
      const [orders, mealTypes, meals] = await Promise.all([
        this.databaseService.order.findMany({
          where: whereCondition,
          select: {
            id: true,
            mealTypeId: true,
            meals: true,
          }
        }),
        this.databaseService.mealType.findMany({
          where: orgId ? { orgId } : {},
          select: {
            id: true,
            name: true,
          }
        }),
        this.databaseService.meal.findMany({
          where: orgId ? { orgId } : {},
          select: {
            id: true,
            nameEnglish: true,
            imageUrl: true,
            description: true,
            ingredients: {
              include: {
                ingredient: {
                  select: { name: true }
                }
              }
            }
          }
        })
      ]);

      if (!orders || orders.length === 0) {
        // Return empty structure with available meal types instead of throwing error
        const emptyResult: { [mealTypeName: string]: any[] } = {};
        mealTypes.forEach(mealType => {
          emptyResult[mealType.name.toLowerCase()] = [];
        });
        return emptyResult;
      }

      // Create lookup maps for faster access
      const mealTypeMap = new Map(mealTypes.map(mt => [mt.id, mt.name.toLowerCase()]));
      const mealMap = new Map(meals.map(meal => [
        meal.id, 
        {
          ...meal,
          ingredients: meal.ingredients.map(mi => mi.ingredient.name)
        }
      ]));

      // Dynamic meal counts object
      const mealCounts: {
        [mealTypeName: string]: { 
          [mealId: number]: { 
            name: string; 
            totalCount: number; 
            imageUrl: string | null;
            mealTypeId: number;
            description: string | null;
            ingredients: string[];
          } 
        };
      } = {};

      // Initialize meal type categories
      mealTypes.forEach(mealType => {
        mealCounts[mealType.name.toLowerCase()] = {};
      });

      // Process orders more efficiently
      for (const order of orders) {
        const mealTypeName = mealTypeMap.get(order.mealTypeId) || 'unknown';
        
        // Initialize meal type if not exists
        if (!mealCounts[mealTypeName]) {
          mealCounts[mealTypeName] = {};
        }

        for (const mealEntry of order.meals) {
          const [mealIdStr, countStr] = mealEntry.split(':');
          const mealId = Number(mealIdStr);
          const count = Number(countStr);

          if (isNaN(mealId) || isNaN(count)) {
            console.warn(`Invalid meal entry format: ${mealEntry}`);
            continue;
          }

          const meal = mealMap.get(mealId);
          if (!meal) {
            console.warn(`Meal with ID ${mealId} not found`);
            continue;
          }

          // Initialize meal in this meal type if not exists
          if (!mealCounts[mealTypeName][mealId]) {
            mealCounts[mealTypeName][mealId] = { 
              name: meal.nameEnglish, 
              totalCount: 0, 
              imageUrl: meal.imageUrl,
              mealTypeId: order.mealTypeId,
              description: meal.description || null,
              ingredients: meal.ingredients
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
          description: string | null;
          ingredients: string[];
        }>;
      } = {};

      for (const [mealTypeName, meals] of Object.entries(mealCounts)) {
        result[mealTypeName] = Object.entries(meals).map(([mealId, { name, totalCount, imageUrl, mealTypeId, description, ingredients }]) => ({
          mealId: Number(mealId),
          name,
          totalCount,
          imageUrl,
          mealTypeId,
          description,
          ingredients,
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