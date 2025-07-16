import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScheduledMealService } from './schedule.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('schedule')
export class ScheduledMealController {
  constructor(private readonly scheduledMealService: ScheduledMealService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async create(
    @Body() body: { date: string; mealTypeId: number; mealIds: number[] },
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.scheduledMealService.create(
        body.date,
        body.mealTypeId,
        body.mealIds,
        orgId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':date')
  async findByDate(
    @Param('date') date: string,
    @Query('orgId') orgId?: string,
  ) {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    return this.scheduledMealService.findByDate(date, orgId);
  }

  @Get()
  async findAll(@Query('orgId') orgId?: string) {
    try {
      return await this.scheduledMealService.findAll(orgId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve schedules',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { date?: string; mealTypeId?: number; mealIds?: number[] },
    @Query('orgId') orgId?: string,
  ) {
    const { mealIds, ...data } = body;
    return this.scheduledMealService.update(id, data, mealIds, orgId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('orgId') orgId?: string,
  ) {
    return this.scheduledMealService.remove(id, orgId);
  }
}