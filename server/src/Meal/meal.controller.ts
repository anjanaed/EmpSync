import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MealService } from './meal.service';
import { Prisma } from '@prisma/client';


@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  create(@Body() createMealDto: Prisma.MealCreateInput) {
    return this.mealService.create(createMealDto);
  }

  @Get()
  findAll() {
    return this.mealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealDto: Prisma.MealUpdateInput,
) {
    return this.mealService.update(+id, updateMealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealService.remove(+id);
  }
}
