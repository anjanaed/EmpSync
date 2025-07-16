import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query, // <-- Add this import
} from '@nestjs/common';
import { MealService } from './meal.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

// Custom DTO for meal creation that includes ingredients
interface CreateMealWithIngredientsDto
  extends Omit<Prisma.MealCreateInput, 'ingredients'> {
  ingredients: Array<{
    ingredientId: number;
  }>;
}

// Custom DTO for meal updates that includes ingredients
interface UpdateMealWithIngredientsDto
  extends Omit<Prisma.MealUpdateInput, 'ingredients'> {
  ingredients?: Array<{
    ingredientId: number;
  }>;
}

@Controller('meal')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async create(
    @Body() createMealDto: CreateMealWithIngredientsDto,
    @Query('orgId') orgId?: string,
  ) {
    try {
      const { ingredients, ...mealData } = createMealDto;
      return await this.mealService.createWithIngredients(
        mealData,
        ingredients,
        orgId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAll(
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealService.findAllWithIngredients(orgId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve meals',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(
    @Param('id') id: string,
    @Query('orgId') orgId?: string,
  ) {
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      const meal = await this.mealService.findOneWithIngredients(parsedId, orgId);
      if (!meal) {
        throw new HttpException('Meal not found', HttpStatus.NOT_FOUND);
      }
      return meal;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealWithIngredientsDto,
    @Query('orgId') orgId?: string,
  ) {
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      const { ingredients, ...mealData } = updateMealDto;
      return await this.mealService.updateWithIngredients(
        parsedId,
        mealData,
        ingredients,
        orgId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN','HR_ADMIN')
  async remove(
    @Param('id') id: string,
    @Query('orgId') orgId?: string,
  ) {
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      return await this.mealService.remove(parsedId, orgId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}