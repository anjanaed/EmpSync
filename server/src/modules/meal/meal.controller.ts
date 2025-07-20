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
import { MealSuggestionService } from './meal-suggestion.service';
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
  constructor(
    private readonly mealService: MealService,
    private readonly mealSuggestionService: MealSuggestionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
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
async findAll(
  @Query('orgId') orgId?: string,
  @Query('includeDeleted') includeDeleted?: string,
) {
  try {
    const include = includeDeleted === 'true';
    return await this.mealService.findAllWithIngredients(orgId, include);
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
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(@Param('id') id: string, @Query('orgId') orgId?: string) {
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      const meal = await this.mealService.findOneWithIngredients(
        parsedId,
        orgId,
      );
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
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
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
async softDelete(
  @Param('id') id: string,
  @Query('orgId') orgId?: string,
) {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    return await this.mealService.softDelete(parsedId, orgId);
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




  @Get('suggestions/:userId')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getMealSuggestions(
    @Param('userId') userId: string,
    @Query('date') date: string,
    @Query('mealTypeId') mealTypeId: string,
    @Query('orgId') orgId?: string,
  ): Promise<any[]> {
    try {
      if (!date || !mealTypeId) {
        throw new HttpException(
          'Date and mealTypeId are required parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      const parsedMealTypeId = parseInt(mealTypeId);
      if (isNaN(parsedMealTypeId)) {
        throw new HttpException(
          'Invalid mealTypeId format',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.mealSuggestionService.getMealSuggestions(
        userId,
        date,
        parsedMealTypeId,
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
}
