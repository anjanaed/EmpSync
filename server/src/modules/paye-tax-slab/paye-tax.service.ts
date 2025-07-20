import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PayeTaxService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPayeTaxDto: Prisma.PayeTaxSlabCreateInput) {
    try {
      return await this.databaseService.payeTaxSlab.createMany({ data: createPayeTaxDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

async findAll(orgId?: string) {
  try {
    return await this.databaseService.payeTaxSlab.findMany({
      where: orgId ? { orgId } : undefined,
    });
  } catch (error) {
    throw new BadRequestException('Failed to retrieve tax record');
  }
}

  async findOne(id: number ) {
    try {
      const tax = await this.databaseService.payeTaxSlab.findUnique({
        where: { id },
      });
      if (!tax) {
        throw new NotFoundException('Tax Record not found');
      }
      return tax;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(updatePayeTaxDto: Prisma.PayeTaxSlabCreateManyInput[]) {
    try {
      
       await this.databaseService.payeTaxSlab.deleteMany();

       return await this.databaseService.payeTaxSlab.createMany({
        data:updatePayeTaxDto,
       });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) { // Change id type to string
    try {
      const numericId = parseInt(id, 10);
      return await this.databaseService.payeTaxSlab.delete({
        where: { id:numericId },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}