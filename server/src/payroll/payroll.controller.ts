import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate-all')
  async generatePayrollsForAll(
    @Body() dto: Prisma.PayrollCreateInput,
    @Res() res: Response,
  ) {
    try {
      await this.payrollService.generatePayrollsForAll(dto);
      res.status(200).json({ message: 'Payrolls Generated' });
    } catch (err) {
      res.status(500).json({ message: 'Error generating payrolls' });
    }
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.payrollService.findAll(search);
  }

  @Get(':empId/:month')
  findOne(@Param('empId') empId: string, @Param('month') month: string) {
    return this.payrollService.findOne(empId, month);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Prisma.PayrollUpdateInput) {
    return this.payrollService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.payrollService.remove(id);
  }

  @Delete('delete-by-month/:month')
  async deletePayrollsByMonth(@Param('month')month:string){
    try{
      return await this.payrollService.deleteByMonth(month);
      
    }catch (err){
      throw new HttpException(err.message,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}
