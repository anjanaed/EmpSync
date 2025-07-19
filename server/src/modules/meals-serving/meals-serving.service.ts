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
        select: {
          id: true,
          employeeId: true,
          orgId: true,
          mealTypeId: true,
          meals: true,
          orderDate: true,
          orderPlacedTime: true,
          price: true,
          serve: true,
        }
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      // Filter orders to ensure they match the exact date (additional safety check)
      const filteredOrders = orders.filter(order => {
        const orderDateOnly = new Date(order.orderDate);
        orderDateOnly.setHours(0, 0, 0, 0);
        const queryDateOnly = new Date(orderDate);
        queryDateOnly.setHours(0, 0, 0, 0);
        
        return orderDateOnly.getTime() === queryDateOnly.getTime();
      });

      const ordersWithMeals = await Promise.all(
        filteredOrders.map(async (order) => {
          const mealDetails = await Promise.all(
            order.meals.map(async (mealEntry) => {
              const [mealId, count] = mealEntry.split(':').map((value) => Number(value));// Split the meal entry into ID and count
              const meal = await this.databaseService.meal.findUnique({ 
                where: { id: mealId },
                select: {
                  id: true,
                  nameEnglish: true,
                  nameSinhala: true,
                  nameTamil: true,
                  description: true,
                  price: true,
                  imageUrl: true,
                  category: true,
                }
              });
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
        select: {
          id: true,
          meals: true,
          orderDate: true,
        }
      });

      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found for the specified date');
      }

      const mealCounts: { [mealId: number]: { name: string; totalCount: number } } = {};

      for (const order of orders) {
        // Double-check that this order is for the exact date we're querying
        const orderDateOnly = new Date(order.orderDate);
        orderDateOnly.setHours(0, 0, 0, 0);
        const queryDateOnly = new Date(orderDate);
        queryDateOnly.setHours(0, 0, 0, 0);
        
        if (orderDateOnly.getTime() !== queryDateOnly.getTime()) {
          continue; // Skip orders that don't match the exact date
        }

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

  // Optimized method to get meal counts allocated by meal time for specific date (dynamic)
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

      // First, get meal types for the organization and date
      const mealTypeWhere: any = {};
      if (orgId) {
        mealTypeWhere.orgId = orgId;
      }

      // Get scheduled meals for the specific date to know which meals should be available
      const scheduledMealsWhere: any = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      };
      if (orgId) {
        scheduledMealsWhere.orgId = orgId;
      }

      // Fetch orders, meal types, meals, and scheduled meals in parallel for better performance
      const [orders, mealTypes, scheduledMeals] = await Promise.all([
        this.databaseService.order.findMany({
          where: whereCondition,
          select: {
            id: true,
            mealTypeId: true,
            meals: true,
            orderDate: true,
          }
        }),
        this.databaseService.mealType.findMany({
          where: mealTypeWhere,
          select: {
            id: true,
            name: true,
          }
        }),
        this.databaseService.scheduledMeal.findMany({
          where: scheduledMealsWhere,
          include: {
            mealType: {
              select: {
                id: true,
                name: true,
              }
            },
            meals: {
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
            }
          }
        })
      ]);

      // Create lookup maps for faster access
      const mealTypeMap = new Map(mealTypes.map(mt => [mt.id, mt.name.toLowerCase()]));
      
      // Create a map of meals available for each meal type on this specific date
      const scheduledMealsByType = new Map<number, any[]>();
      const allScheduledMeals = new Map<number, any>();

      scheduledMeals.forEach(scheduled => {
        if (!scheduledMealsByType.has(scheduled.mealTypeId)) {
          scheduledMealsByType.set(scheduled.mealTypeId, []);
        }
        
        scheduled.meals.forEach(meal => {
          const mealWithIngredients = {
            ...meal,
            ingredients: meal.ingredients.map(mi => mi.ingredient.name)
          };
          scheduledMealsByType.get(scheduled.mealTypeId)!.push(mealWithIngredients);
          allScheduledMeals.set(meal.id, mealWithIngredients);
        });
      });

      // If no orders found, return empty object (no meal types shown)
      if (!orders || orders.length === 0) {
        return {};
      }

      // Initialize result structure - only include meal types that have orders
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

      // Process orders and update counts for the specific date
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

      // Process orders - only count orders that match the exact date
      for (const order of orders) {
        // Double-check that this order is for the exact date we're querying
        const orderDateOnly = new Date(order.orderDate);
        orderDateOnly.setHours(0, 0, 0, 0);
        const queryDateOnly = new Date(orderDate);
        queryDateOnly.setHours(0, 0, 0, 0);
        
        if (orderDateOnly.getTime() !== queryDateOnly.getTime()) {
          continue; // Skip orders that don't match the exact date
        }

        const mealTypeName = mealTypeMap.get(order.mealTypeId) || 'unknown';
        
        // Skip if meal type doesn't exist
        if (!mealTypeMap.has(order.mealTypeId)) {
          console.warn(`Unknown meal type ID: ${order.mealTypeId}`);
          continue;
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
            console.warn(`Invalid meal entry format: ${mealEntry}`);
            continue;
          }

          // Only count meals that are actually scheduled for this date and meal type
          const meal = allScheduledMeals.get(mealId);
          if (!meal) {
            console.warn(`Meal with ID ${mealId} not scheduled for date ${orderDate.toISOString().split('T')[0]}`);
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

      // Only include meal types that have at least one order
      for (const [mealTypeName, meals] of Object.entries(mealCounts)) {
        const mealsWithOrders = Object.entries(meals)
          .filter(([mealId, mealData]) => mealData.totalCount > 0) // Only include meals with orders
          .map(([mealId, { name, totalCount, imageUrl, mealTypeId, description, ingredients }]) => ({
            mealId: Number(mealId),
            name,
            totalCount,
            imageUrl,
            mealTypeId,
            description,
            ingredients,
          }));

        // Only add the meal type to result if it has meals with orders
        if (mealsWithOrders.length > 0) {
          result[mealTypeName] = mealsWithOrders;
        }
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