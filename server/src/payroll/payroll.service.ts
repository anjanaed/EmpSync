import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { calculateSalary } from './payrollCal/calculator';
import { generatePayslip } from './payrollCal/pdfGen';

@Injectable()
export class PayrollService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.PayrollCreateInput) {
    try {
      return await this.databaseService.payroll.create({ data: dto });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generatePayrollsForAll(dto: Prisma.PayrollCreateInput): Promise<any> {
    const range=dto.range
    try {
      const users = await this.databaseService.user.findMany({
        
      });

      const allAllowancePRaw =
        await this.databaseService.salaryAdjustments.findMany({
          where: {
            isPercentage: true,
            allowance: true,
          },
        });
      const allAllowanceP = allAllowancePRaw.map((items) => ({
        label: items.label,
        amount: items.amount,
      }));
      const allAllowanceVRaw =
        await this.databaseService.salaryAdjustments.findMany({
          where: {
            isPercentage: false,
            allowance: true,
          },
        });
      const allAllowanceV = allAllowanceVRaw.map((items) => ({
        label: items.label,
        amount: items.amount,
      }));
      const allDeductionPRaw =
        await this.databaseService.salaryAdjustments.findMany({
          where: {
            isPercentage: true,
            allowance: false,
          },
        });
      const allDeductionP = allDeductionPRaw.map((items) => ({
        label: items.label,
        amount: items.amount,
      }));
      const allDeductionVRaw =
        await this.databaseService.salaryAdjustments.findMany({
          where: {
            isPercentage: false,
            allowance: false,
          },
        });
      const allDeductionV = allDeductionVRaw.map((items) => ({
        label: items.label,
        amount: items.amount,
      }));

      for (const user of users) {
        const allowancePRaw =
          await this.databaseService.individualSalaryAdjustments.findMany({
            where: {
              empId: user.id,
              isPercentage: true,
              allowance: true,
            },
          });
        const indiAllowanceP = allowancePRaw.map((items) => ({
          label: items.label,
          amount: items.amount,
        }));
        const allowanceP = [...indiAllowanceP, ...allAllowanceP];

        const allowanceVRaw =
          await this.databaseService.individualSalaryAdjustments.findMany({
            where: {
              empId: user.id,
              isPercentage: false,
              allowance: true,
            },
          });

        const indiAllowanceV = allowanceVRaw.map((items) => ({
          label: items.label,
          amount: items.amount,
        }));

        const allowanceV = [...indiAllowanceV, ...allAllowanceV];

        const deductionPRaw =
          await this.databaseService.individualSalaryAdjustments.findMany({
            where: {
              empId: user.id,
              isPercentage: true,
              allowance: false,
            },
          });
        const indiDeductionsP = deductionPRaw.map((items) => ({
          label: items.label,
          amount: items.amount,
        }));
        const deductionsP = [...indiDeductionsP, ...allDeductionP];

        const deductionVRaw =
          await this.databaseService.individualSalaryAdjustments.findMany({
            where: {
              empId: user.id,
              isPercentage: false,
              allowance: false,
            },
          });
        const indiDeductionsV = deductionVRaw.map((items) => ({
          label: items.label,
          amount: items.amount,
        }));

        const deductionsV = [...indiDeductionsV, ...allDeductionV];

        const userDetails = await this.databaseService.user.findUnique({
          where: {
            id: user.id,
          },
        });

        const payeData=await this.databaseService.payeTaxSlab.findMany()

        const values = calculateSalary({
          basicSalary: userDetails.salary,
          allowanceP,
          allowanceV,
          deductionsP,
          deductionsV,
        },payeData);

        console.log(values);
        

        const payroll = await this.create({
          employee: { connect: { id: user.id } },
          month: "startMonth",
          netPay: values.netSalary,
          payrollPdf: `C:\\Users\\USER\\Downloads\\Payrolls\\${user.id}`,
        });


        generatePayslip({
          employee: user,
          values,
          range,
          payroll: {
            id: payroll.id,
            createdAt: payroll.createdAt,
          },
        });




      }
    } catch (err) {
      console.log(err);
    }
  }

  async findAll() {
    try {
      const payrolls = await this.databaseService.payroll.findMany({});
      if (payrolls) {
        return payrolls;
      } else {
        throw new HttpException('No Payrolls', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(empId: string, range: string[]) {
    try {
      const payroll = await this.databaseService.payroll.findFirst({
        where: {
          empId,
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

  async update(id: number, dto: Prisma.PayrollUpdateInput) {
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

  async remove(id: number) {
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
