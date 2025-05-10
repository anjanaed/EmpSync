import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class IndiAdjustmentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createIndiAdjustmentDto: Prisma.IndividualSalaryAdjustmentsCreateInput,
  ) {
    try {
      return await this.databaseService.individualSalaryAdjustments.create({
        data: createIndiAdjustmentDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(search?: string) {
    try {
      return await this.databaseService.individualSalaryAdjustments.findMany({
        where: search
          ? {
              OR: [
                { empId: { contains: search, mode: 'insensitive' } },
                { label: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve Adjustments');
    }
  }

  async findOne(id: number) {
    try {
      const adjust =
        await this.databaseService.individualSalaryAdjustments.findUnique({
          where: { id },
        });
      if (!adjust) {
        throw new NotFoundException('Adjustment not found');
      }
      return adjust;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(
    id: number,
    updateIndiAdjustmentDto: Prisma.IndividualSalaryAdjustmentsUpdateInput,
  ) {
    try {
      return await this.databaseService.individualSalaryAdjustments.update({
        where: { id },
        data: updateIndiAdjustmentDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        throw new BadRequestException(
          'Invalid ID format. ID must be a number.',
        );
      }

      return await this.databaseService.individualSalaryAdjustments.delete({
        where: { id: numericId },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
