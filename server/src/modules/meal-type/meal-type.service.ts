import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { startOfDay, endOfDay } from 'date-fns';

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
              createdAt: {
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
  async create(name: string, time?: string[] | string, isDefault?: boolean) {
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
      return this.databaseService.mealType.create({
        data: {
          name,
          time: timeArr,
          isDefault: isDefault ?? false,
        },
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
}
