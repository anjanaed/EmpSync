import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { calculateSalary } from './payrollCal/calculator';

@Injectable()
export class PayrollService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.PayrollCreateInput) {
    try {
      await this.databaseService.payroll.create({ data: dto });
      return 'Payroll Generated';
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const payrolls = await this.databaseService.payroll.findMany({});
      if (payrolls) {
        return payrolls;
      } else {
        throw new HttpException('No Payrolls',HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(empId: string, month: string) {
    try {
      const payroll = await this.databaseService.payroll.findFirst({
        where: {
          empId,
          month,
        },
      });
      if (payroll) {
        return payroll;
      } else {
        throw new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, dto: Prisma.PayrollUpdateInput) {
    try {
      const payroll = await this.databaseService.payroll.findUnique({
        where: {
          id,
        },
      });
      if (payroll) {
        await this.databaseService.payroll.update({
          where: {
            id,
          },
          data: dto,
        });
      } else {
        throw new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const payroll = await this.databaseService.payroll.findUnique({
        where: {
          id,
        },
      });
      if (payroll) {
        await this.databaseService.payroll.delete({
          where: {
            id,
          },
        });
      } else {
        throw new HttpException('Payroll Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}


const salaryCalcDto={
  basic: this.DatabaseService.user.salary
}


