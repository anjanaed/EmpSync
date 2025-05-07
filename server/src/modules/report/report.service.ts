import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAdjustmentDto: Prisma.ReportsCreateInput) {
    try {
      return await this.databaseService.reports.create({ data: createAdjustmentDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.databaseService.reports.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve Report');
    }
  }

  async findOne(id: number ) {
    try {
      const report = await this.databaseService.reports.findUnique({
        where: { id },
      });
      if (!report) {
        throw new NotFoundException('Report not found');
      }
      return report;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateAdjustmentDto: Prisma.ReportsUpdateInput) {
    try {
      const numericId = parseInt(id, 10);
      return await this.databaseService.reports.update({
        where: { id:numericId },
        data: updateAdjustmentDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) { // Change id type to string
    try {
      const numericId = parseInt(id, 10);
      return await this.databaseService.reports.delete({
        where: { id:numericId },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
