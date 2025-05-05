import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PersonalizedMealSuggestionsService } from './personalized-meal-suggestions.service';

@Controller('meal-suggestions')
export class PersonalizedMealSuggestionsController {
  constructor(private readonly suggestionsService: PersonalizedMealSuggestionsService) {}

  @Get()
  async getSuggestions(@Query('userId') userId: string): Promise<any[]> {
    if (!userId) {
      throw new HttpException(
        'The "userId" query parameter is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const suggestions = await this.suggestionsService.getPersonalizedSuggestions(userId);

    if (!suggestions || suggestions.length === 0) {
      throw new HttpException(
        'No meal suggestions found for the given user.',
        HttpStatus.NOT_FOUND,
      );
    }

    return suggestions;
  }
}