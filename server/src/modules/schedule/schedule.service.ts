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
  ) {
    try {
      // Parse the date string to a Date object and add UTC+5:30 offset (330 minutes)
      const scheduledDate = new Date(new Date(date).getTime() + 330 * 60 * 1000);
      
      // Check if a schedule for this date and meal type already exists
      const existingSchedule = await this.databaseService.scheduledMeal.findUnique({
        where: {
          date_mealTypeId: {
            date: scheduledDate,
            mealTypeId,
          },
        },
      });

      if (existingSchedule) {
        throw new BadRequestException('A schedule already exists for this date and meal type');
      }

      // Create scheduled meal with meal connections
      return this.databaseService.scheduledMeal.create({
        data: {
          date: scheduledDate, // 
          mealTypeId,
          meals: {
            connect: mealIds.map(id => ({ id })),
          },
        },
        include: {
          mealType: true,
          meals: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to create scheduled meal: ${error.message}`);
    }
  }

  // Replace the findAll method
async findAll(date?: string) {
  try {
    if (date) {
      const targetDate = new Date(date);
      
      // First check if there are any schedules for this date
      const schedulesExist = await this.databaseService.scheduledMeal.findFirst({
        where: { date: targetDate }
      });

      // If no schedules exist for this date, return empty array
      if (!schedulesExist) {
        return [];
      }

      // If schedules exist, get all meals for that date
      return this.databaseService.scheduledMeal.findMany({
        where: { date: targetDate },
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
        orderBy: [
          { mealType: { name: 'asc' } },
        ],
      });
    }

    // If no date provided, return all scheduled meals
    return this.databaseService.scheduledMeal.findMany({
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
      orderBy: [
        { date: 'asc' },
        { mealType: { name: 'asc' } },
      ],
    });
  } catch (error) {
    throw new BadRequestException('Failed to retrieve scheduled meals');
  }
}

  // Find a single scheduled meal by ID
  async findOne(id: number) {
    try {
      const scheduledMeal = await this.databaseService.scheduledMeal.findUnique({
        where: { id },
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

  // Find scheduled meals by date
  async findByDate(date: string) {
    try {
      const targetDate = new Date(date);
      
      const scheduledMeals = await this.databaseService.scheduledMeal.findMany({
        where: { date: targetDate },
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
      throw new BadRequestException(`Failed to retrieve scheduled meals for date: ${error.message}`);
    }
  }

  // Update a scheduled meal
  async update(
    id: number,
    data?: { date?: string; mealTypeId?: number },
    mealIds?: number[],
  ) {
    try {
      // First, fetch the existing scheduled meal
      const existingSchedule = await this.databaseService.scheduledMeal.findUnique({
        where: { id },
      });

      if (!existingSchedule) {
        throw new NotFoundException('Scheduled meal not found');
      }

      return await this.databaseService.$transaction(async (prisma) => {
        // Create update data object
        const updateData: any = {};
        
        // Add date if provided
        if (data?.date) {
          updateData.date = new Date(data.date);
        }
        
        // Add mealTypeId if provided
        if (data?.mealTypeId) {
          updateData.mealTypeId = data.mealTypeId;
        }
        
        // If we have meal IDs, update the connections
        if (mealIds && mealIds.length > 0) {
          updateData.meals = {
            set: mealIds.map(id => ({ id })),
          };
        }
        
        // Update the scheduled meal
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
      throw new BadRequestException(`Failed to update scheduled meal: ${error.message}`);
    }
  }

  // Delete a scheduled meal
  async remove(id: number) {
    try {
      const scheduledMeal = await this.databaseService.scheduledMeal.findUnique({
        where: { id },
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