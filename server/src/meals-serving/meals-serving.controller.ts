import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { MealsServingService } from './meals-serving.service';

@Controller('meals-serving')
export class MealsServingController {
  constructor(private readonly mealsServingService: MealsServingService) {}

  // Endpoint to retrieve a meal by its ID
  @Get(':id')
  async findMealsServingByMealId(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealsServingService.findMealsServingByMealId(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve meal');
    }
  }
}