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

// ...existing imports...
@Injectable()
export class MealTypeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly scheduledMealService: ScheduledMealService,
  ) {}

  // Get all meal types, with defaults first
  async findAll(orgId?: string) {
    try {
      return this.databaseService.mealType.findMany({
        where: {
          orgId: orgId || undefined,
        },
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' },
        ],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal types');
    }
  }

  // Find a single meal type by ID
  async findOne(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined },
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

  async toggleIsDefault(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined },
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
  async findDefaults(orgId?: string) {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      return this.databaseService.mealType.findMany({
        where: {
          OR: [
            { orgId: orgId || undefined }, // Include all meal types for the organization
            {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
              orgId: orgId || undefined,
            },
          ],
        },
        orderBy: [
          { isDefault: 'desc' }, // Show defaults first, but include all
          { name: 'asc' },
        ],
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
    orgId?: string,
  ) {
    try {
      let timeArr: string[] | undefined = undefined;
      if (time !== undefined) {
        if (Array.isArray(time)) {
          timeArr = time;
        } else if (typeof time === 'string') {
          timeArr = [time];
        }
      }

      const data: any = {
        name,
        time: timeArr,
        isDefault: isDefault ?? false,
        orgId: orgId || undefined,
      };

      if (date) {
        const baseDate = new Date(date);
        data.date = addMinutes(baseDate, 330);
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
    orgId?: string,
  ) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

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
  async remove(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined },
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

  async findTodayAndTomorrow(orgId?: string) {
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

      // Get all meal types for the organization, not just defaults
      const allMeals = await this.databaseService.mealType.findMany({
        where: { orgId: orgId || undefined },
        orderBy: [
          { isDefault: 'desc' }, // Show defaults first, but include all
          { name: 'asc' },
        ],
      });

      const getMergedMeals = async (
        start: Date,
        end: Date,
        dateString: string,
      ): Promise<any[]> => {
        const scheduledMeals = await this.scheduledMealService.findByDate(dateString, orgId);

        const usedAllMeals = allMeals.filter((meal) =>
          scheduledMeals.some((schedule) => schedule.mealTypeId === meal.id),
        );

        const mealsWithDate = await this.databaseService.mealType.findMany({
          where: {
            date: { gte: start, lte: end },
            orgId: orgId || undefined,
          },
          orderBy: { name: 'asc' },
        });

        const mealMap = new Map<number, any>();
        [...mealsWithDate, ...usedAllMeals].forEach((meal) =>
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

  async patchTimeElement(id: number, index: 0 | 1, newTime: string, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      let updatedTime: string[] = Array.isArray(mealType.time)
        ? [...mealType.time]
        : ['', ''];

      while (updatedTime.length < 2) {
        updatedTime.push('');
      }

      updatedTime[index] = newTime;

      return await this.databaseService.mealType.update({
        where: { id },
        data: { time: updatedTime },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to patch time element: ${error.message}`,
      );
    }
  }

  // Get meal types created at a specific date (IST) and all default meals
  async findByDateOrDefault(dateString: string, orgId?: string) {
    try {
      const dateIST = addMinutes(parseISO(dateString), 330);

      const dayStartIST = startOfDay(dateIST);
      const dayEndIST = endOfDay(dateIST);
      const dayStartUTC = subMinutes(dayStartIST, 330);
      const dayEndUTC = subMinutes(dayEndIST, 330);

      const meals = await this.databaseService.mealType.findMany({
        where: {
          OR: [
            { orgId: orgId || undefined }, // Include all meal types for the organization
            {
              date: {
                gte: dayStartUTC,
                lte: dayEndUTC,
              },
              orgId: orgId || undefined,
            },
          ],
        },
        orderBy: [
          { isDefault: 'desc' }, // Show defaults first, but include all
          { name: 'asc' },
        ],
      });

      return meals;
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve meal types for the given date',
      );
    }
  }
}