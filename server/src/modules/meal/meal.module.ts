import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';

@Module({
  controllers: [MealController],
  providers: [MealService],
})
export class MealModule {}
