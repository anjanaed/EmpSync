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

  // Get all meal types, excluding soft-deleted ones
  async findAll(orgId?: string) {
    try {
      return this.databaseService.mealType.findMany({
        where: {
          orgId: orgId || undefined,
          isDeleted: false,
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

  async findOne(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined, isDeleted: false },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      return mealType;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async toggleIsDefault(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined, isDeleted: false },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      return await this.databaseService.mealType.update({
        where: { id },
        data: { isDefault: !mealType.isDefault },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to toggle isDefault: ${error.message}`);
    }
  }

  async findDefaults(orgId?: string) {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      return this.databaseService.mealType.findMany({
        where: {
          isDeleted: false,
          OR: [
            { isDefault: true, orgId: orgId || undefined },
            {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
              orgId: orgId || undefined,
            },
          ],
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve default meal types');
    }
  }

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
        timeArr = Array.isArray(time) ? time : [time];
      }

      const data: any = {
        name,
        time: timeArr,
        isDefault: isDefault ?? false,
        orgId: orgId || undefined,
        isDeleted: false,
      };

      if (date) {
        data.date = addMinutes(new Date(date), 330);
      }

      return this.databaseService.mealType.create({ data });
    } catch (error) {
      throw new BadRequestException(`Failed to create meal type: ${error.message}`);
    }
  }

  async softDelete(id: number, orgId?: string) {
  try {
    // First check if the meal type exists and belongs to the organization
    const mealType = await this.databaseService.mealType.findFirst({
      where: { 
        id, 
        orgId: orgId || undefined, 
        isDeleted: false 
      },
    });

    if (!mealType) {
      throw new NotFoundException('Meal type not found or already deleted');
    }

    // Perform the soft delete
    const updatedMealType = await this.databaseService.mealType.update({
      where: { id },
      data: { 
        isDeleted: true,
        
      },
    });

    return updatedMealType;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    console.error('Soft delete error:', error);
    throw new BadRequestException(`Failed to delete meal type: ${error.message}`);
  }
}

  async update(
    id: number,
    data: { name?: string; time?: string[] | string; isDefault?: boolean },
    orgId?: string,
  ) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined, isDeleted: false },
      });

      if (!mealType) throw new NotFoundException('Meal type not found');

      let timeArr: string[] | undefined = undefined;
      if (data.time !== undefined) {
        timeArr = Array.isArray(data.time) ? data.time : [data.time];
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
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update meal type: ${error.message}`);
    }
  }

  
  async findTodayAndTomorrow(orgId?: string) {
    try {
      const now = addMinutes(new Date(), 330);

      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const tomorrow = addDays(now, 1);
      const tomorrowStart = startOfDay(tomorrow);
      const tomorrowEnd = endOfDay(tomorrow);

      const todayIST = now.toISOString().split('T')[0];
      const tomorrowIST = tomorrow.toISOString().split('T')[0];

      const defaultMeals = await this.databaseService.mealType.findMany({
        where: {
          isDefault: true,
          orgId: orgId || undefined,
          isDeleted: false,
        },
        orderBy: { name: 'asc' },
      });

      const getMergedMeals = async (start: Date, end: Date, dateString: string) => {
        const scheduledMeals = await this.scheduledMealService.findByDate(dateString, orgId);

        const usedDefaultMeals = defaultMeals.filter((defaultMeal) =>
          scheduledMeals.some((schedule) => schedule.mealTypeId === defaultMeal.id),
        );

        const mealsWithDate = await this.databaseService.mealType.findMany({
          where: {
            date: { gte: start, lte: end },
            orgId: orgId || undefined,
            isDeleted: false,
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

  async patchTimeElement(id: number, index: 0 | 1, newTime: string, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { id, orgId: orgId || undefined, isDeleted: false },
      });

      if (!mealType) throw new NotFoundException('Meal type not found');

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
      throw new BadRequestException(`Failed to patch time element: ${error.message}`);
    }
  }

  async findByDateOrDefault(dateString: string, orgId?: string) {
    try {
      const dateIST = addMinutes(parseISO(dateString), 330);

      const dayStartIST = startOfDay(dateIST);
      const dayEndIST = endOfDay(dateIST);
      const dayStartUTC = subMinutes(dayStartIST, 330);
      const dayEndUTC = subMinutes(dayEndIST, 330);

      const meals = await this.databaseService.mealType.findMany({
        where: {
          isDeleted: false,
          OR: [
            { isDefault: true, orgId: orgId || undefined },
            {
              date: {
                gte: dayStartUTC,
                lte: dayEndUTC,
              },
              orgId: orgId || undefined,
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


