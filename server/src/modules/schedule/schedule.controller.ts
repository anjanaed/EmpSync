import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ScheduledMealService } from './schedule.service';

@Controller('schedule')
export class ScheduledMealController {
  constructor(private readonly scheduledMealService: ScheduledMealService) {}

  @Post()
  async create(
    @Body() body: { date: string; mealTypeId: number; mealIds: number[] },
  ) {
    try {
      return await this.scheduledMealService.create(
        body.date,
        body.mealTypeId,
        body.mealIds,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':date')
  findByDate(@Param('date') date: string) {
    // Validate date format
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    return this.scheduledMealService.findByDate(date);
  }

  @Get()
  findAll() {
    return this.scheduledMealService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { date?: string; mealTypeId?: number; mealIds?: number[] },
  ) {
    const { mealIds, ...data } = body;
    return this.scheduledMealService.update(id, data, mealIds);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduledMealService.remove(id);
  }
}