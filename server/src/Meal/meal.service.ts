import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MealService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createMealDto: Prisma.MealCreateInput) {
    try {
      return await this.databaseService.meal.create({ data: createMealDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.databaseService.meal.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meals');
    }
  }

  async findOne(id: string) { // Changed id type to string
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: { id },
      });
      if (!meal) {
        throw new NotFoundException('Meal not found');
      }
      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateMealDto: Prisma.MealUpdateInput) { // Changed id type to string
    try {
      return await this.databaseService.meal.update({
        where: { id },
        data: updateMealDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) { // Changed id type to string
    try {
      return await this.databaseService.meal.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
