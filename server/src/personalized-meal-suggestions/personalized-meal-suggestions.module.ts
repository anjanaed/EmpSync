import { Module } from '@nestjs/common';
import { PersonalizedMealSuggestionsService } from './personalized-meal-suggestions.service';
import { PersonalizedMealSuggestionsController } from './personalized-meal-suggestions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PersonalizedMealSuggestionsController],
  providers: [PersonalizedMealSuggestionsService],
})
export class PersonalizedMealSuggestionsModule {}