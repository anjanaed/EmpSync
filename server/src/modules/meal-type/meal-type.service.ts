import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

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

  // Get default meal types only
  async findDefaults() {
    try {
      return this.databaseService.mealType.findMany({
        where: { isDefault: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve default meal types');
    }
  }

  // Create a new meal type
  async create(name: string, time?: string, isDefault?: boolean) {
    try {
      return this.databaseService.mealType.create({
        data: {
          name,
          time,
          isDefault: isDefault || false,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to create meal type: ${error.message}`);
    }
  }

  // Update a meal type
  async update(id: number, data: { name?: string; time?: string; isDefault?: boolean }) {
    try {
      const mealType = await this.databaseService.mealType.findUnique({
        where: { id },
      });

      if (!mealType) {
        throw new NotFoundException('Meal type not found');
      }

      return this.databaseService.mealType.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update meal type: ${error.message}`);
    }
  }

  // Delete a meal type (only if not used in any schedules)
  async remove(id: number) {
    try {
      // Check if this meal type is used in any schedules
      const usedInSchedule = await this.databaseService.scheduledMeal.findFirst({
        where: { mealTypeId: id },
      });

      if (usedInSchedule) {
        throw new BadRequestException('Cannot delete meal type that is used in schedules');
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