import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdjustmentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAdjustmentDto: Prisma.SalaryAdjustmentsCreateInput) {
    try {
      return await this.databaseService.salaryAdjustments.create({ data: createAdjustmentDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.databaseService.salaryAdjustments.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve Adjustments');
    }
  }

  async findOne(id: number ) {
    try {
      const meal = await this.databaseService.salaryAdjustments.findUnique({
        where: { id },
      });
      if (!meal) {
        throw new NotFoundException('Adjustment not found');
      }
      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateAdjustmentDto: Prisma.SalaryAdjustmentsUpdateInput) {
    try {
      return await this.databaseService.salaryAdjustments.update({
        where: { id },
        data: updateAdjustmentDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) { // Change id type to string
    try {
      const numericId = parseInt(id, 10);
      return await this.databaseService.salaryAdjustments.delete({
        where: { id:numericId },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
