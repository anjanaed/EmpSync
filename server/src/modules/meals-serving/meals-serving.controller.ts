import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { MealsServingService } from './meals-serving.service';

@Controller('meals-serving')
export class MealsServingController {
  constructor(private readonly mealsServingService: MealsServingService) {}

  @Get('orders-by-date')
  async findOrdersByDate(@Query('date') date: string) {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return await this.mealsServingService.findOrdersByDate(parsedDate);
    } catch (error) {
      throw error;
    }
  }

  @Get('meal-order-counts')
  async getMealOrderCountsByDate(@Query('date') date: string) {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return await this.mealsServingService.getMealOrderCountsByDate(parsedDate);
    } catch (error) {
      throw error;
    }
  }

  // New endpoint to get meal counts by meal time
  @Get('meal-counts-by-time')
  async getMealCountsByMealTime(@Query('date') date: string) {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return await this.mealsServingService.getMealCountsByMealTime(parsedDate);
    } catch (error) {
      throw error;
    }
  }
}