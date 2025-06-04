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
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { PayrollService } from './payroll.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async update(
    @Param('id') id: number,
    @Body() dto: Prisma.PayrollUpdateInput,
  ) {
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
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
