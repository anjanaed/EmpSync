import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createScheduleDto: Prisma.ScheduledMealCreateInput) {
    try {
      const formattedDate = new Date(createScheduleDto.date).toISOString().split('T')[0];
      return await this.databaseService.scheduledMeal.create({
        data: {
          ...createScheduleDto,
          date: new Date(formattedDate),
          breakfast: createScheduleDto.breakfast || [],
          lunch: createScheduleDto.lunch || [],
          dinner: createScheduleDto.dinner || [],
          confirmed: false, // <-- explicitly set confirmed to false
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  

  async findAll() {
    try {
      return await this.databaseService.scheduledMeal.findMany();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve scheduled meals');
    }
  }

  async findOne(date: string) {
    try {
      const formattedDate = new Date(date);
      const scheduledMeal = await this.databaseService.scheduledMeal.findUnique({
        where: { date: formattedDate },
      });
      
      if (!scheduledMeal) {
        throw new NotFoundException(`Scheduled meal not found for date: ${date}`);
      }
      
      return scheduledMeal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
  

  async update(date: string, updateScheduleDto: Prisma.ScheduledMealUpdateInput) {
    try {
      const formattedDate = new Date(date + "T00:00:00.000Z");
      const existingRecord = await this.databaseService.scheduledMeal.findUnique({
        where: { date: formattedDate },
      });
      if (!existingRecord) {
        throw new NotFoundException(`Scheduled meal not found for date: ${date}`);
      }
      return await this.databaseService.scheduledMeal.update({
        where: { date: formattedDate },
        data: {
          breakfast: updateScheduleDto.breakfast || [],
          lunch: updateScheduleDto.lunch || [],
          dinner: updateScheduleDto.dinner || [],
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(date: string) {
    try {
      return await this.databaseService.scheduledMeal.delete({
        where: { date: new Date(date) },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async confirm(date: string) {
    try {
      const formattedDate = new Date(date);
  
      if (isNaN(formattedDate.getTime())) {
        throw new BadRequestException(`Invalid date format: ${date}`);
      }
  
      const existing = await this.databaseService.scheduledMeal.findUnique({
        where: { date: formattedDate },
      });
  
      if (!existing) {
        throw new NotFoundException(`Scheduled meal not found for date: ${date}`);
      }
  
      return await this.databaseService.scheduledMeal.update({
        where: { date: formattedDate },
        data: { confirmed: true },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
  
  
}