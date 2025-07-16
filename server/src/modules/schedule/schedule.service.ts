import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ScheduledMealService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Create a scheduled meal with meal connections
  async create(
    date: string,
    mealTypeId: number,
    mealIds: number[],
    orgId?: string,
  ) {
    try {
      const scheduledDate = new Date(
        new Date(date).getTime() + 330 * 60 * 1000,
      );

      // Check if a schedule for this date, meal type, and org already exists
      const existingSchedule =
        await this.databaseService.scheduledMeal.findFirst({
          where: {
            date: scheduledDate,
            mealTypeId,
            orgId: orgId || undefined,
          },
        });

      if (existingSchedule) {
        throw new BadRequestException(
          'A schedule already exists for this date and meal type',
        );
      }

      // Create scheduled meal with meal connections
      return this.databaseService.scheduledMeal.create({
        data: {
          date: scheduledDate,
          mealTypeId,
          orgId: orgId || undefined,
          meals: {
            connect: mealIds.map((id) => ({ id })),
          },
        },
        include: {
          mealType: true,
          meals: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create scheduled meal: ${error.message}`,
      );
    }
  }

  // Find all scheduled meals, optionally filtered by orgId
  async findAll(orgId?: string) {
    try {
      return this.databaseService.scheduledMeal.findMany({
        where: {
          orgId: orgId || undefined,
        },
        include: {
          mealType: true,
          meals: {
            select: {
              id: true,
              nameEnglish: true,
              nameSinhala: true,
              nameTamil: true,
              price: true,
              imageUrl: true,
              category: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { mealType: { name: 'asc' } }],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve scheduled meals');
    }
  }

  // Find a single scheduled meal by ID and orgId
  async findOne(id: number, orgId?: string) {
    try {
      const scheduledMeal = await this.databaseService.scheduledMeal.findFirst({
        where: { id, orgId: orgId || undefined },
        include: {
          mealType: true,
          meals: true,
        },
      });

      if (!scheduledMeal) {
        throw new NotFoundException('Scheduled meal not found');
      }

      return scheduledMeal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Find scheduled meals by date and orgId
  async findByDate(date: string, orgId?: string) {
    try {
      const targetDate = new Date(date);

      const scheduledMeals = await this.databaseService.scheduledMeal.findMany({
        where: {
          date: targetDate,
          orgId: orgId || undefined,
        },
        include: {
          mealType: true,
          meals: true,
        },
        orderBy: {
          mealType: { name: 'asc' },
        },
      });

      return scheduledMeals;
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve scheduled meals for date: ${error.message}`,
      );
    }
  }

  // Update a scheduled meal
  async update(
    id: number,
    data?: { date?: string; mealTypeId?: number },
    mealIds?: number[],
    orgId?: string,
  ) {
    try {
      // First, fetch the existing scheduled meal
      const existingSchedule =
        await this.databaseService.scheduledMeal.findFirst({
          where: { id, orgId: orgId || undefined },
        });

      if (!existingSchedule) {
        throw new NotFoundException('Scheduled meal not found');
      }

      return await this.databaseService.$transaction(async (prisma) => {
        const updateData: any = {};

        if (data?.date) {
          updateData.date = new Date(data.date);
        }
        if (data?.mealTypeId) {
          updateData.mealType = { connect: { id: data.mealTypeId } };
        }
        if (orgId) {
          updateData.orgId = orgId;
        }
        if (mealIds && mealIds.length > 0) {
          updateData.meals = {
            set: mealIds.map((id) => ({ id })),
          };
        }

        return prisma.scheduledMeal.update({
          where: { id },
          data: updateData,
          include: {
            mealType: true,
            meals: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update scheduled meal: ${error.message}`,
      );
    }
  }

  // Delete a scheduled meal
  async remove(id: number, orgId?: string) {
    try {
      const scheduledMeal = await this.databaseService.scheduledMeal.findFirst({
        where: { id, orgId: orgId || undefined },
      });

      if (!scheduledMeal) {
        throw new NotFoundException('Scheduled meal not found');
      }

      return await this.databaseService.scheduledMeal.delete({
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
