import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { startOfDay, endOfDay, addDays, subMinutes, addMinutes, parseISO } from 'date-fns';

@Injectable()
export class MealTypeService {
  constructor(private readonly databaseService: DatabaseService) {}

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
    date?: Date | string
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
        date: date
      };

      // If date is provided, add it to the data object
      if (date) {
        data.date = new Date(date);
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
      const usedInSchedule = await this.databaseService.scheduledMeal.findFirst(
        {
          where: { mealTypeId: id },
        },
      );

      if (usedInSchedule) {
        throw new BadRequestException(
          'Cannot delete meal type that is used in schedules',
        );
      }

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

  // Get meal types created today and tomorrow
  async findTodayAndTomorrow() {
    try {
      // Shift current time by +5:30 (330 minutes) to get IST "now"
      const nowIST = addMinutes(new Date(), 330);

      // Calculate IST day boundaries, then convert back to UTC for querying
      const todayStartIST = startOfDay(nowIST);
      const todayEndIST = endOfDay(nowIST);
      const tomorrowStartIST = startOfDay(addDays(nowIST, 1));
      const tomorrowEndIST = endOfDay(addDays(nowIST, 1));

      // Convert IST boundaries back to UTC for DB query
      const todayStartUTC = subMinutes(todayStartIST, 330);
      const todayEndUTC = subMinutes(todayEndIST, 330);
      const tomorrowStartUTC = subMinutes(tomorrowStartIST, 330);
      const tomorrowEndUTC = subMinutes(tomorrowEndIST, 330);

      const todayMeals = await this.databaseService.mealType.findMany({
        where: {
          OR: [
            { isDefault: true },
            {
              date: {
                gte: todayStartUTC,
                lte: todayEndUTC,
              },
            },
          ],
        },
        orderBy: { name: 'asc' },
      });

      const tomorrowMeals = await this.databaseService.mealType.findMany({
        where: {
          OR: [
            { isDefault: true },
            {
              date: {
                gte: tomorrowStartUTC,
                lte: tomorrowEndUTC,
              },
            },
          ],
        },
        orderBy: { name: 'asc' },
      });

      return [todayMeals, tomorrowMeals];
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve today and tomorrow meal types',
      );
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
      throw new BadRequestException('Failed to retrieve meal types for the given date');
    }
  }
}
