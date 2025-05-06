import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { MealService } from './meal.service';
import { Prisma } from '@prisma/client';

// Custom DTO for meal creation that includes ingredients
interface CreateMealWithIngredientsDto extends Omit<Prisma.MealCreateInput, 'ingredients'> {
  ingredients: Array<{
    ingredientId: number;
  }>;
}

// Custom DTO for meal updates that includes ingredients
interface UpdateMealWithIngredientsDto extends Omit<Prisma.MealUpdateInput, 'ingredients'> {
  ingredients?: Array<{
    ingredientId: number;
  }>;
}

@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  async create(@Body() createMealDto: CreateMealWithIngredientsDto) {
    try {
      // Convert DTO to Prisma format
      const { ingredients, ...mealData } = createMealDto;
      
      // Create the meal with ingredients relationships
      return await this.mealService.createWithIngredients(mealData, ingredients);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.mealService.findAllWithIngredients();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve meals',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {  
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      const meal = await this.mealService.findOneWithIngredients(parsedId);
      if (!meal) {
        throw new HttpException('Meal not found', HttpStatus.NOT_FOUND);
      }
      return meal;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMealDto: UpdateMealWithIngredientsDto) {  
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      const { ingredients, ...mealData } = updateMealDto;
      return await this.mealService.updateWithIngredients(parsedId, mealData, ingredients);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {  
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      return await this.mealService.remove(parsedId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
}