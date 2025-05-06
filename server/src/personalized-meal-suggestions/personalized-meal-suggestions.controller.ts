import { Controller, Get, Query, HttpException, HttpStatus, Param } from '@nestjs/common';
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

  @Get('/user/:userId')
  async findOrdersByUserId(@Param('userId') userId: string) {
    try {
      return await this.suggestionsService.findOrdersByUserId(userId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/user-details/:userId')
  async findUsersByUserId(@Param('userId') userId: string) {
    try {
      return await this.suggestionsService.findUsersByUserId(userId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/meal/:id')
  async findMealsByMealId(@Param('id') id: number) {
    try {
      return await this.suggestionsService.findMealsByMealId(id);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/scheduled-meals')
  async findMealsByScheduledDate(@Query('date') date: string) {
    try {
      if (!date) {
        throw new HttpException('The "date" query parameter is required.', HttpStatus.BAD_REQUEST);
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new HttpException('Invalid date format. Use "YYYY-MM-DD".', HttpStatus.BAD_REQUEST);
      }

      return await this.suggestionsService.findMealsByScheduledDate(parsedDate);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/available-meals/:userId')
  async getAvailableMeals(@Param('userId') userId: string) {
    try {
      return await this.suggestionsService.getAvailableMeals(userId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/personalized')
  async getPersonalizedSuggestionsForDate(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ): Promise<any[]> {
    if (!userId || !date) {
      throw new HttpException(
        'Both "userId" and "date" query parameters are required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new HttpException('Invalid date format. Use "YYYY-MM-DD".', HttpStatus.BAD_REQUEST);
    }

    return await this.suggestionsService.getPersonalizedSuggestionsForDate(userId, parsedDate);
  }
}
