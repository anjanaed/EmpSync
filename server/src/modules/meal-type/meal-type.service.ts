import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  format,
} from 'date-fns';

@Injectable()
export class MealTypeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly scheduledMealService: ScheduledMealService,
  ) {}

  // Common where clause to exclude soft-deleted records
  private getBaseWhereClause(orgId?: string) {
    return {
      orgId: orgId || undefined,
      isDeleted: false, // Always exclude soft-deleted records
    };
  }

  // Helper method to check for duplicate meal types
  private async checkDuplicateMealType(
    name: string,
    date: Date | string,
    orgId?: string,
    excludeId?: number
  ) {
    try {
      const targetDate = new Date(date);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

      const whereClause: any = {
        name: {
          equals: name,
          mode: 'insensitive', // Case-insensitive comparison
        },
        orgId: orgId || undefined,
        isDeleted: false,
        OR: [
          {
            // Check for default meal types (they apply to all days)
            isDefault: true,
          },
          {
            // Check for meal types created for the specific date
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        ],
      };

      // If we're updating, exclude the current record
      if (excludeId) {
        whereClause.id = {
          not: excludeId,
        };
      }

      const existingMealType = await this.databaseService.mealType.findFirst({
        where: whereClause,
      });

      return existingMealType;
    } catch (error) {
      console.error('Error checking duplicate meal type:', error);
      throw new BadRequestException('Failed to validate meal type uniqueness');
    }
  }

  // Get all meal types, excluding soft-deleted ones
  async findAll(orgId?: string) {
    try {
      return this.databaseService.mealType.findMany({
        where: this.getBaseWhereClause(orgId),
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal types');
    }
  }

  async findOne(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { 
          id, 
          ...this.getBaseWhereClause(orgId)
        },
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
        where: { 
          id, 
          ...this.getBaseWhereClause(orgId)
        },
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
      throw new BadRequestException(
        `Failed to toggle isDefault: ${error.message}`,
      );
    }
  }

  async findDefaults(orgId?: string) {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      return this.databaseService.mealType.findMany({
        where: {
          isDeleted: false, // Ensure soft-deleted records are excluded
          OR: [
            { 
              isDefault: true, 
              orgId: orgId || undefined 
            },
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
      // Validate required parameters
      if (!name || name.trim().length === 0) {
        throw new BadRequestException('Meal type name is required');
      }

      // Set default date if not provided
      const targetDate = date ? new Date(date) : new Date();
      
      // Check for duplicate meal types
      const existingMealType = await this.checkDuplicateMealType(
        name.trim(),
        targetDate,
        orgId
      );

      if (existingMealType) {
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        let errorMessage: string;

        if (existingMealType.isDefault) {
          errorMessage = `A default meal type with the name "${name}" already exists. Please choose a different name.`;
        } else {
          const existingDateStr = format(new Date(existingMealType.date), 'yyyy-MM-dd');
          errorMessage = `A meal type with the name "${name}" already exists for ${existingDateStr}. Please choose a different name or date.`;
        }

        throw new ConflictException(errorMessage);
      }

      let timeArr: string[] | undefined = undefined;
      if (time !== undefined) {
        timeArr = Array.isArray(time) ? time : [time];
      }

      const data: any = {
        name: name.trim(),
        time: timeArr,
        isDefault: isDefault ?? false,
        orgId: orgId || undefined,
        isDeleted: false, // Explicitly set to false for new records
      };

      if (date) {
        data.date = addMinutes(new Date(date), 330);
      } else {
        data.date = addMinutes(new Date(), 330);
      }

      const createdMealType = await this.databaseService.mealType.create({ data });
      
      console.log(`Created meal type: ${createdMealType.name} for date: ${format(targetDate, 'yyyy-MM-dd')}`);
      
      return createdMealType;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating meal type:', error);
      throw new BadRequestException(
        `Failed to create meal type: ${error.message}`,
      );
    }
  }

  async softDelete(id: number, orgId?: string) {
    try {
      // First check if the meal type exists and belongs to the organization
      const mealType = await this.databaseService.mealType.findFirst({
        where: { 
          id, 
          ...this.getBaseWhereClause(orgId) // This ensures we only find non-deleted records
        },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found or already deleted');
      }

      // Check if this meal type is being used in any active schedules
      const activeSchedules = await this.databaseService.scheduledMeal.count({
        where: {
          mealTypeId: id,
          // Add any other conditions to check for active schedules
        },
      });

      if (activeSchedules > 0) {
        console.log(`Warning: Meal type ${id} (${mealType.name}) is being used in ${activeSchedules} schedules`);
      }

      // Perform the soft delete - ONLY update isDeleted to true
      const updatedMealType = await this.databaseService.mealType.update({
        where: { id },
        data: { 
          isDeleted: true,
          // Don't modify any other fields
        },
      });

      // Log the soft delete operation for debugging
      console.log(`Meal type ${id} (${mealType.name}) has been soft deleted`);

      return {
        success: true,
        message: 'Meal type deleted successfully',
        id: updatedMealType.id,
        name: mealType.name, // Return the original name
        isDeleted: updatedMealType.isDeleted,
        warningMessage: activeSchedules > 0 ? 
          `This meal type was used in ${activeSchedules} schedules` : null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Soft delete error:', error);
      throw new BadRequestException(`Failed to delete meal type: ${error.message}`);
    }
  }

  // Method to restore a soft-deleted meal type (optional)
  async restore(id: number, orgId?: string) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { 
          id, 
          orgId: orgId || undefined,
          isDeleted: true // Look for deleted records
        },
      });

      if (!mealType) {
        throw new NotFoundException('Deleted meal type not found');
      }

      const restoredMealType = await this.databaseService.mealType.update({
        where: { id },
        data: { 
          isDeleted: false,
        },
      });

      return {
        success: true,
        message: 'Meal type restored successfully',
        id: restoredMealType.id,
        name: restoredMealType.name,
        isDeleted: restoredMealType.isDeleted
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to restore meal type: ${error.message}`);
    }
  }

  async update(
    id: number,
    data: { name?: string; time?: string[] | string; isDefault?: boolean },
    orgId?: string,
  ) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { 
          id, 
          ...this.getBaseWhereClause(orgId)
        },
      });

      if (!mealType) throw new NotFoundException('Meal type not found');

      // If name is being updated, check for duplicates
      if (data.name && data.name.trim() !== mealType.name) {
        const existingMealType = await this.checkDuplicateMealType(
          data.name.trim(),
          mealType.date,
          orgId,
          id // Exclude current record from duplicate check
        );

        if (existingMealType) {
          const dateStr = format(new Date(mealType.date), 'yyyy-MM-dd');
          throw new ConflictException(
            `A meal type with the name "${data.name}" already exists for ${dateStr}. Please choose a different name.`
          );
        }
      }

      let timeArr: string[] | undefined = undefined;
      if (data.time !== undefined) {
        timeArr = Array.isArray(data.time) ? data.time : [data.time];
      }

      const updateData: any = {
        ...data,
        time: timeArr,
      };

      // Trim name if provided
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }

      return this.databaseService.mealType.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update meal type: ${error.message}`,
      );
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
          isDeleted: false, // Exclude soft-deleted records
        },
        orderBy: { name: 'asc' },
      });

      const getMergedMeals = async (
        start: Date,
        end: Date,
        dateString: string,
      ) => {
        const scheduledMeals = await this.scheduledMealService.findByDate(
          dateString,
          orgId,
        );

        const usedDefaultMeals = defaultMeals.filter((defaultMeal) =>
          scheduledMeals.some(
            (schedule) => schedule.mealTypeId === defaultMeal.id,
          ),
        );

        const mealsWithDate = await this.databaseService.mealType.findMany({
          where: {
            date: { gte: start, lte: end },
            orgId: orgId || undefined,
            isDeleted: false, // Exclude soft-deleted records
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

  async patchTimeElement(
    id: number,
    index: 0 | 1,
    newTime: string,
    orgId?: string,
  ) {
    try {
      const mealType = await this.databaseService.mealType.findFirst({
        where: { 
          id, 
          ...this.getBaseWhereClause(orgId)
        },
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
      throw new BadRequestException(
        `Failed to patch time element: ${error.message}`,
      );
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
          isDeleted: false, // Exclude soft-deleted records
          OR: [
            { 
              isDefault: true, 
              orgId: orgId || undefined 
            },
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
      throw new BadRequestException(
        'Failed to retrieve meal types for the given date',
      );
    }
  }

  // Additional method to get soft-deleted records for reports/admin purposes
  async findAllIncludingDeleted(orgId?: string, includeDeleted: boolean = false) {
    try {
      const whereClause = {
        orgId: orgId || undefined,
        ...(includeDeleted ? {} : { isDeleted: false })
      };

      return this.databaseService.mealType.findMany({
        where: whereClause,
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }, { isDeleted: 'asc' }],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal types');
    }
  }

  // Method to get only soft-deleted records for admin/reporting
  async findDeleted(orgId?: string) {
    try {
      return this.databaseService.mealType.findMany({
        where: {
          orgId: orgId || undefined,
          isDeleted: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve deleted meal types');
    }
  }

  // Helper method to check if a meal type name exists for a specific date
  async checkMealTypeExists(name: string, date: Date | string, orgId?: string) {
    try {
      const existingMealType = await this.checkDuplicateMealType(name, date, orgId);
      return {
        exists: !!existingMealType,
        mealType: existingMealType,
        isDefault: existingMealType?.isDefault || false,
      };
    } catch (error) {
      throw new BadRequestException('Failed to check meal type existence');
    }
  }
}