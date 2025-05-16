import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class MealTypeService {
  private prisma = new PrismaClient();

  // Create a new MealType
  async create(createMealTypeDto: Prisma.MealTypeCreateInput) {
    try {
      return await this.prisma.mealType.create({
        data: createMealTypeDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Get all MealTypes
  async findAll() {
    try {
      return await this.prisma.mealType.findMany();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal types');
    }
  }

  // Get all MealTypes where isDefault is true
  async findDefaults() {
    try {
      return await this.prisma.mealType.findMany({
        where: { isDefault: true },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve default meal types');
    }
  }

  // Get a single MealType by id
  async findOne(id: string) {
    try {
      const mealType = await this.prisma.mealType.findUnique({
        where: { id: Number(id) },
      });
      if (!mealType) {
        throw new NotFoundException('MealType not found');
      }
      return mealType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Update a MealType by id
  async update(id: number, updateMealTypeDto: Prisma.MealTypeUpdateInput) {
    try {
      return await this.prisma.mealType.update({
        where: { id },
        data: updateMealTypeDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Delete a MealType by id
  async remove(id: string) {
    try {
      return await this.prisma.mealType.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}