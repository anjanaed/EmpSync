import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createScheduleDto: Prisma.ScheduledMealCreateInput) {
    try {
      const formattedDate = new Date(createScheduleDto.date)
        .toISOString()
        .split('T')[0];

      // Convert string arrays to number arrays if they exist
      const breakfast = Array.isArray(createScheduleDto.breakfast)
        ? createScheduleDto.breakfast.map((id) => Number(id))
        : [];
      const lunch = Array.isArray(createScheduleDto.lunch)
        ? createScheduleDto.lunch.map((id) => Number(id))
        : [];
      const dinner = Array.isArray(createScheduleDto.dinner)
        ? createScheduleDto.dinner.map((id) => Number(id))
        : [];

      return await this.databaseService.scheduledMeal.create({
        data: {
          date: new Date(formattedDate),
          breakfast,
          lunch,
          dinner,
          confirmed: false,
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
      const scheduledMeal = await this.databaseService.scheduledMeal.findUnique(
        {
          where: { date: formattedDate },
        },
      );

      if (!scheduledMeal) {
        throw new NotFoundException(
          `Scheduled meal not found for date: ${date}`,
        );
      }

      return scheduledMeal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(
    date: string,
    updateScheduleDto: Prisma.ScheduledMealUpdateInput,
  ) {
    const formattedDate = new Date(date + 'T00:00:00.000Z');

    // First check if the record exists
    const existingRecord = await this.databaseService.scheduledMeal.findUnique({
      where: { date: formattedDate },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Scheduled meal not found for date: ${date}`);
    }

    try {
      // Convert string arrays to number arrays if they exist
      const breakfast = Array.isArray(updateScheduleDto.breakfast)
        ? updateScheduleDto.breakfast.map((id) => Number(id))
        : undefined;
      const lunch = Array.isArray(updateScheduleDto.lunch)
        ? updateScheduleDto.lunch.map((id) => Number(id))
        : undefined;
      const dinner = Array.isArray(updateScheduleDto.dinner)
        ? updateScheduleDto.dinner.map((id) => Number(id))
        : undefined;

      return await this.databaseService.scheduledMeal.update({
        where: { date: formattedDate },
        data: {
          breakfast,
          lunch,
          dinner,
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
        throw new NotFoundException(
          `Scheduled meal not found for date: ${date}`,
        );
      }

      return await this.databaseService.scheduledMeal.update({
        where: { date: formattedDate },
        data: { confirmed: true },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
