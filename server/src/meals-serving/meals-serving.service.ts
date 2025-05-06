// meals-serving.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MealsServingService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Existing methods: findMealsServingByMealId, findOrdersByDate ...

  // New method to get total count of each meal ordered on a specific date
  async getMealOrderCountsByDate(orderDate: Date) {
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

      // Aggregate meal counts
      const mealCounts: { [mealId: number]: { name: string; totalCount: number } } = {};

      for (const order of orders) {
        for (const mealEntry of order.meals) {
          const [mealIdStr, countStr] = mealEntry.split(':');
          const mealId = Number(mealIdStr);
          const count = Number(countStr);

          if (isNaN(mealId) || isNaN(count)) {
            throw new BadRequestException(`Invalid meal entry format: ${mealEntry}`);
          }

          // Fetch meal details to include the name
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

      // Convert mealCounts to an array for cleaner response
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
}