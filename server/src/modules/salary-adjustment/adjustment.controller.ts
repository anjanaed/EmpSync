import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Put,
  HttpException,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdjustmentService } from './adjustment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('adjustment')
export class AdjustmentController {
  constructor(private readonly adjustmentService: AdjustmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async create(@Body() dto: Prisma.SalaryAdjustmentsCreateInput) {
    try {
      return await this.adjustmentService.create(dto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create adjustment',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async findAll(@Query('orgId') orgId?: string) { 
    try {
      return await this.adjustmentService.findAll(orgId); 
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch adjustments',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async findOne(@Param('id') id: number) {
    try {
      const adjustment = await this.adjustmentService.findOne(id);
      if (!adjustment) {
        throw new HttpException('Adjustment not found', HttpStatus.NOT_FOUND);
      }
      return adjustment;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Failed to fetch adjustment',
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: Prisma.SalaryAdjustmentsUpdateInput,
  ) {
    try {
      return await this.adjustmentService.update(id, dto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update adjustment',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async remove(@Param('id') id: string) {
    try {
      return await this.adjustmentService.remove(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete adjustment',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
