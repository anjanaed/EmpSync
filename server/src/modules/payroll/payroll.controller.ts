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
      res.status(500).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error generating payrolls',
        message: err.message,
      });
    }
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    try {
      return await this.payrollService.findAll(search);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch payrolls',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':empId/:month')
  async findOne(@Param('empId') empId: string, @Param('month') month: string) {
    try {
      const payroll = await this.payrollService.findOne(empId, month);
      if (!payroll) {
        throw new HttpException('Payroll not found', HttpStatus.NOT_FOUND);
      }
      return payroll;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Failed to fetch payroll',
          message: err.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: Prisma.PayrollUpdateInput) {
    try {
      return await this.payrollService.update(id, dto);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update payroll',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return await this.payrollService.remove(id);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete payroll',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('delete-by-month/:month')
  async deletePayrollsByMonth(@Param('month') month: string) {
    try {
      return await this.payrollService.deleteByMonth(month);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to delete payrolls by month',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}