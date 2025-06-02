import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ScheduledMealService } from '../schedule/schedule.service';
import {
  startOfDay,
  endOfDay,
  addDays,
  subMinutes,
  addMinutes,
  parseISO,
} from 'date-fns';

@Injectable()
export class MealTypeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly scheduledMealService: ScheduledMealService,
  ) {}

  // Get all meal types, with defaults first
  async findAll() {
    try {
      return this.databaseService.mealType.findMany({
        orderBy: [
          { isDefault: 'desc' }, // Default meal types first
          { name: 'asc' }, // Then alphabetically by name
        ],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal types');
    }
  }

  // Find a single meal type by ID
  async findOne(id: number) {
    try {
      const mealType = await this.databaseService.mealType.findUnique({
        where: { id },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      return mealType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async toggleIsDefault(id: number) {
    try {
      const mealType = await this.databaseService.mealType.findUnique({
        where: { id },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      // Toggle the isDefault value
      const updated = await this.databaseService.mealType.update({
        where: { id },
        data: { isDefault: !mealType.isDefault },
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to toggle isDefault: ${error.message}`,
      );
    }
  }

  // Get default meal types only
  async findDefaults() {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      return this.databaseService.mealType.findMany({
        where: {
          OR: [
            { isDefault: true },
            {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          ],
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve default meal types');
    }
  }

  // Create a new meal type
  async create(
    name: string,
    time?: string[] | string,
    isDefault?: boolean,
    date?: Date | string,
  ) {
    try {
      // Always store time as an array of strings
      let timeArr: string[] | undefined = undefined;
      if (time !== undefined) {
        if (Array.isArray(time)) {
          timeArr = time;
        } else if (typeof time === 'string') {
          timeArr = [time];
        }
      }

      // Prepare the data object
      const data: any = {
        name,
        time: timeArr,
        isDefault: isDefault ?? false,
      };

      // If date is provided, add it to the data object as UTC+5:30
      if (date) {
        const baseDate = new Date(date);
        data.date = addMinutes(baseDate, 330); // Shift to UTC+5:30
      }

      return this.databaseService.mealType.create({
        data,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create meal type: ${error.message}`,
      );
    }
  }

  // Update a meal type
  async update(
    id: number,
    data: { name?: string; time?: string[] | string; isDefault?: boolean },
  ) {
    try {
      const mealType = await this.databaseService.mealType.findUnique({
        where: { id },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      // Always store time as an array of strings
      let timeArr: string[] | undefined = undefined;
      if (data.time !== undefined) {
        if (Array.isArray(data.time)) {
          timeArr = data.time;
        } else if (typeof data.time === 'string') {
          timeArr = [data.time];
        }
      }

      const updateData: any = {
        ...data,
        time: timeArr,
      };

      return this.databaseService.mealType.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update meal type: ${error.message}`,
      );
    }
  }

  // Delete a meal type (only if not used in any schedules)
  async remove(id: number) {
    try {
      // Check if this meal type is used in any schedules
      // const usedInSchedule = await this.databaseService.scheduledMeal.findFirst(
      //   {
      //     where: { mealTypeId: id },
      //   },
      // );

      // if (usedInSchedule) {
      //   throw new BadRequestException(
      //     'Cannot delete meal type that is used in schedules',
      //   );
      // }

      const mealType = await this.databaseService.mealType.findUnique({
        where: { id },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      return await this.databaseService.mealType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

 

async findTodayAndTomorrow() {
  try {
    const timezoneOffsetMinutes = 330;
    const now = addMinutes(new Date(), timezoneOffsetMinutes);

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const tomorrow = addDays(now, 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const todayIST = now.toISOString().split('T')[0];
    const tomorrowIST = tomorrow.toISOString().split('T')[0];

    const defaultMeals = await this.databaseService.mealType.findMany({
      where: { isDefault: true },
      orderBy: { name: 'asc' },
    });

    // Helper to get merged meals for a given date range
    const getMergedMeals = async (
      start: Date,
      end: Date,
      dateString: string,
    ): Promise<any[]> => {
      const scheduledMeals = await this.scheduledMealService.findByDate(dateString);

      const usedDefaultMeals = defaultMeals.filter((defaultMeal) =>
        scheduledMeals.some((schedule) => schedule.mealTypeId === defaultMeal.id),
      );

      const mealsWithDate = await this.databaseService.mealType.findMany({
        where: {
          date: { gte: start, lte: end },
        },
        orderBy: { name: 'asc' },
      });

      const mealMap = new Map<number, any>();
      [...mealsWithDate, ...usedDefaultMeals].forEach((meal) =>
        mealMap.set(meal.id, meal),
      );

      return Array.from(mealMap.values());
    };

    const [mergedTodayMeals, mergedTomorrowMeals] = await Promise.all([
      getMergedMeals(todayStart, todayEnd, todayIST),
      getMergedMeals(tomorrowStart, tomorrowEnd, tomorrowIST),
    ]);

    return [mergedTodayMeals, mergedTomorrowMeals];
  } catch (error) {
    console.error('Error in findTodayAndTomorrow:', error);
    return [[], []];
  }
}


  // Get meal types created at a specific date (IST) and all default meals
  async findByDateOrDefault(dateString: string) {
    try {
      // Parse the date string (e.g., "2024-05-25") as IST
      // Shift to IST by adding 5:30 (330 minutes)
      const dateIST = addMinutes(parseISO(dateString), 330);

      // Get start and end of the day in IST, then convert back to UTC
      const dayStartIST = startOfDay(dateIST);
      const dayEndIST = endOfDay(dateIST);
      const dayStartUTC = subMinutes(dayStartIST, 330);
      const dayEndUTC = subMinutes(dayEndIST, 330);

      const meals = await this.databaseService.mealType.findMany({
        where: {
          OR: [
            { isDefault: true },
            {
              date: {
                gte: dayStartUTC,
                lte: dayEndUTC,
              },
            },
          ],
        },
        orderBy: { name: 'asc' },
      });

      return meals;
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve meal types for the given date',
      );
    }
  }
}
