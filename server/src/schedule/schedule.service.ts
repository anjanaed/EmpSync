import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createScheduleDto: Prisma.ScheduledMealCreateInput) {
    // Ensure date is only 'YYYY-MM-DD'
    const formattedDate = new Date(createScheduleDto.date).toISOString().split('T')[0];

    return this.databaseService.scheduledMeal.create({
      data: {
        ...createScheduleDto,
        date: new Date(formattedDate), // Store as DATE
        breakfast: createScheduleDto.breakfast || [],
        lunch: createScheduleDto.lunch || [],
        dinner: createScheduleDto.dinner || [],
      },
    });
  }

  async findAll() {
    return this.databaseService.scheduledMeal.findMany();
  }

  async findOne(date: string) {
    return this.databaseService.scheduledMeal.findUnique({
      where: { date: new Date(date) }, // Search by date only
    });
  }

  async update(date: string, updateScheduleDto: Prisma.ScheduledMealUpdateInput) {
    try {
      // Convert date string to a Date object (force time to 00:00:00)
      const formattedDate = new Date(date + "T00:00:00.000Z");
  
      // Check if the record exists for the given date
      const existingRecord = await this.databaseService.scheduledMeal.findUnique({
        where: { date: formattedDate },
      });
  
      if (!existingRecord) {
        throw new Error(`Scheduled meal not found for date: ${date}`);
      }
  
      // Prepare the update data, making sure arrays are properly handled
      const updateData: Prisma.ScheduledMealUpdateInput = {
        breakfast: updateScheduleDto.breakfast || [], // Ensure array is not null or undefined
        lunch: updateScheduleDto.lunch || [], // Same for lunch
        dinner: updateScheduleDto.dinner || [], // Same for dinner
      };
  
      // Perform the update
      return this.databaseService.scheduledMeal.update({
        where: { date: formattedDate },
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating scheduled meal:", error.message);
      throw new Error("Failed to update the scheduled meal");
    }
  }
  

  async remove(date: string) {
    return this.databaseService.scheduledMeal.delete({
      where: { date: new Date(date) }, // Delete by date
    });
  }
}
