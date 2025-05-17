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

  @Get()
  findAll(@Query('date') date?: string) {
    return this.scheduledMealService.findAll(date);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.scheduledMealService.findByDate(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduledMealService.findOne(id);
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