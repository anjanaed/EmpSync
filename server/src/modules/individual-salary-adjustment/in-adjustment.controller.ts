import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IndiAdjustmentService } from './in-adjustment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('indiadjustment')
export class IndiAdjustmentController {
  constructor(private readonly IndiAdjustmentService: IndiAdjustmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async create(@Body() dto: Prisma.IndividualSalaryAdjustmentsCreateInput) {
    try {
      return await this.IndiAdjustmentService.create(dto);
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
  async findAll(@Query('search') search?: string,@Query('orgId') orgId?: string) {
    try {
      return await this.IndiAdjustmentService.findAll(search,orgId);
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
      const adjust = await this.IndiAdjustmentService.findOne(id);
      if (!adjust) {
        throw new HttpException('Adjustment not found', HttpStatus.NOT_FOUND);
      }
      return adjust;
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
    @Param('id') id: number,
    @Body() dto: Prisma.IndividualSalaryAdjustmentsUpdateInput,
  ) {
    try {
      return await this.IndiAdjustmentService.update(id, dto);
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
      return await this.IndiAdjustmentService.remove(id);
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
