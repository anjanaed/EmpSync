import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealSuggestionService } from './meal-suggestion.service';
import { MealSuggestionAccuracyService } from './meal-suggestion-accuracy.service';
import { MealController } from './meal.controller';
import { MealSuggestionAccuracyController } from './meal-suggestion-accuracy.controller';

@Module({
  controllers: [MealController, MealSuggestionAccuracyController],
  providers: [MealService, MealSuggestionService, MealSuggestionAccuracyService],
  exports: [MealService, MealSuggestionService, MealSuggestionAccuracyService],
})
export class MealModule {}
