import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { MealTypeService } from './meal-type.service';

@Controller('meal-types')
export class MealTypeController {
  constructor(private readonly mealTypeService: MealTypeService) {}

  @Get()
  findAll() {
    return this.mealTypeService.findAll();
  }

  @Get('defaults')
  findDefaults() {
    return this.mealTypeService.findDefaults();
  }

  @Get('fetch')
  async fetchTodayAndTomorrow() {
    return this.mealTypeService.findTodayAndTomorrow();
  }

  @Get('by-date/:date')
  async findByDateOrDefault(@Param('date') date: string) {
    return this.mealTypeService.findByDateOrDefault(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mealTypeService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { name: string; time?: string; isDefault?: boolean },
  ) {
    try {
      return this.mealTypeService.create(
        body.name,
        body.time,
        body.isDefault,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id/toggle-default')
  async toggleDefault(@Param('id', ParseIntPipe) id: number) {
    return this.mealTypeService.toggleIsDefault(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; time?: string; isDefault?: boolean },
  ) {
    return this.mealTypeService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mealTypeService.remove(id);
  }
}