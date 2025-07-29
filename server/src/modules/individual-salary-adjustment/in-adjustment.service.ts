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
  createIndiAdjustmentDto: Prisma.IndividualSalaryAdjustmentsCreateInput & { empNo?: string }
) {
  try {
    // If empNo is provided, look up the user by empNo and orgId
    if (createIndiAdjustmentDto.empNo) {
      const user = await this.databaseService.user.findFirst({
        where: {
          empNo: createIndiAdjustmentDto.empNo,
          organizationId: createIndiAdjustmentDto.orgId,
        },
        select: { id: true },
      });
      if (!user) {
        throw new BadRequestException('Employee not found for given empNo and orgId');
      }
      // Set empId to the found user's id

      createIndiAdjustmentDto.employee = { connect: { id: String(user.id) } };
      delete createIndiAdjustmentDto.empNo;
    }
    return await this.databaseService.individualSalaryAdjustments.create({
      data: createIndiAdjustmentDto,
    });
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

async findAll(search?: string, orgId?: string) {
  try {
    const where: any = {};

    if (orgId) {
      where.orgId = orgId;
    }

    if (search) {
      where.OR = [
        { empId: { contains: search, mode: 'insensitive' } },
        { label: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await this.databaseService.individualSalaryAdjustments.findMany({
      where,
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
