import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { calculateSalary } from './payroll-cal/calculator';
import { generatePayslip } from './payroll-cal/pdf-gen';

@Injectable()
export class PayrollService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.PayrollCreateInput) {
    try {
      return await this.databaseService.payroll.create({ data: dto })
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generatePayrollsForAll(dto: Prisma.PayrollCreateInput): Promise<any> {
    try {
      const users = await this.databaseService.user.findMany();
      const payeData = await this.databaseService.payeTaxSlab.findMany();
      const allAdjustments =
        await this.databaseService.salaryAdjustments.findMany();
      const allIndividualAdjustments =
        await this.databaseService.individualSalaryAdjustments.findMany();
      const employerFundRate = allAdjustments.find(
        (adj) => adj.label == 'EmployerFund',
      ).amount;
      const ETF = allAdjustments.find((adj) => adj.label == 'ETF').amount;
      const range = dto.range;
      const month = dto.month;

      //Function to divide additions and deduction based on their type (percentage & value)
      function extractAdjustments(
        data: any,
        allowance: boolean,
        percentage: boolean,
      ) {
        return data
          .filter(
            (adj: any) =>
              adj.isPercentage == percentage && adj.allowance == allowance,
          )
          .map((adj: any) => ({ label: adj.label, amount: adj.amount }));
      }

      //Function to divide individual additions and deduction based on their type (percentage & value)
      function extractIndividualAdjustment(
        data: any,
        user: string,
        allowance: boolean,
        percentage: boolean,
      ) {
        return data
          .filter(
            (adj: any) =>
              adj.empId == user &&
              adj.allowance == allowance &&
              adj.isPercentage == percentage,
          )
          .map((adj: any) => ({ label: adj.label, amount: adj.amount }));
      }

      //Extraction of General Adjustments
      const allAllowanceP = extractAdjustments(allAdjustments, true, true);
      const allAllowanceV = extractAdjustments(allAdjustments, true, false);
      const allDeductionV = extractAdjustments(allAdjustments, false, false);

      //Filter Out Company Contributions from Employee deductions
      const allDeductionP = allAdjustments
        .filter(
          (adj) =>
            adj.isPercentage &&
            !adj.allowance &&
            !['ETF', 'EmployerFund'].includes(adj.label),
        )
        .map((adj) => ({ label: adj.label, amount: adj.amount }));

      //Process Individual Adjustments for each user
      for (const user of users) {
        const indiAllowanceP = extractIndividualAdjustment(
          allIndividualAdjustments,
          user.id,
          true,
          true,
        );
        const indiAllowanceV = extractIndividualAdjustment(
          allIndividualAdjustments,
          user.id,
          true,
          false,
        );
        const indiDeductionsP = extractIndividualAdjustment(
          allIndividualAdjustments,
          user.id,
          false,
          true,
        );
        const indiDeductionsV = extractIndividualAdjustment(
          allIndividualAdjustments,
          user.id,
          false,
          false,
        );

        //Merging Individual Adjustments and General Adjustments
        const allowanceP = [...indiAllowanceP, ...allAllowanceP];
        const allowanceV = [...indiAllowanceV, ...allAllowanceV];
        const deductionsP = [...indiDeductionsP, ...allDeductionP];
        const deductionsV = [...indiDeductionsV, ...allDeductionV];

        //Passing Data to receive calculated Data
        const values = calculateSalary(
          {
            basicSalary: user.salary,
            allowanceP,
            allowanceV,
            deductionsP,
            deductionsV,
          },
          payeData,
        );

        //Create Payroll Record
        const payroll = await this.create({
          employee: { connect: { id: user.id } },
          month: month,
          netPay: values.netSalary,
          payrollPdf: `http://localhost:3000/pdfs/${user.id}-${month}.pdf`,
        });

        //Passing Calculated Data & Payroll record Data for PDF generation
        await generatePayslip({
          employee: user,
          values,
          payroll: {
            id: payroll.id,
            createdAt: payroll.createdAt,
          },
          employerFundRate,
          ETF,
          month,
        });
      }
      console.log('Payrolls Generated');
    } catch (err) {
      console.log(err);
    }
  }

  async findAll(search?:string) {
    try {
      const payrolls = await this.databaseService.payroll.findMany({
        include:{
          employee:true,
        },
        where:search?{OR:[
          {empId: {contains:search,mode:'insensitive'}},
        ],
      }:{},});
      if (payrolls) {
        return payrolls;
      } else {
        throw new HttpException('No Payrolls', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(empId: string,month:string) {
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

  async deleteByMonth(month:string){
    try{
      await this.databaseService.payroll.deleteMany({
        where:{month},
      })
    }catch(err){
      throw new Error("Failed to Delete Payrolls")
    }
  }
}
