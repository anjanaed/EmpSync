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

      // Initialize result structure with all meal types
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

      // Initialize all meal types (even if no orders exist)
      mealTypes.forEach(mealType => {
        const mealTypeName = mealType.name.toLowerCase();
        result[mealTypeName] = [];
        
        // Add all scheduled meals for this meal type with 0 count
        const scheduledForType = scheduledMealsByType.get(mealType.id) || [];
        scheduledForType.forEach(meal => {
          result[mealTypeName].push({
            mealId: meal.id,
            name: meal.nameEnglish,
            totalCount: 0,
            imageUrl: meal.imageUrl,
            mealTypeId: mealType.id,
            description: meal.description || null,
            ingredients: meal.ingredients,
          });
        });
      });

      // If no orders found, return the initialized structure with scheduled meals
      if (!orders || orders.length === 0) {
        return result;
      }

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

      // Initialize meal type categories
      mealTypes.forEach(mealType => {
        mealCounts[mealType.name.toLowerCase()] = {};
      });

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

      // Update the result with actual counts
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

      // Ensure all scheduled meals are included (merge with counted meals)
      mealTypes.forEach(mealType => {
        const mealTypeName = mealType.name.toLowerCase();
        const scheduledForType = scheduledMealsByType.get(mealType.id) || [];
        
        // Create a map of existing results for this meal type
        const existingMeals = new Map(result[mealTypeName].map(meal => [meal.mealId, meal]));
        
        // Add any scheduled meals that weren't in the orders
        scheduledForType.forEach(scheduledMeal => {
          if (!existingMeals.has(scheduledMeal.id)) {
            result[mealTypeName].push({
              mealId: scheduledMeal.id,
              name: scheduledMeal.nameEnglish,
              totalCount: 0,
              imageUrl: scheduledMeal.imageUrl,
              mealTypeId: mealType.id,
              description: scheduledMeal.description || null,
              ingredients: scheduledMeal.ingredients,
            });
          }
        });
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal counts by meal time: ${error.message}`);
    }
  }
}