import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealSuggestionService } from './meal-suggestion.service';
import { MealController } from './meal.controller';

@Module({
  controllers: [MealController],
  providers: [MealService, MealSuggestionService],
})
export class MealModule {}
