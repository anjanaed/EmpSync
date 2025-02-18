import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Prisma } from '@prisma/client';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  async create(@Body() createIngredientDto: Prisma.IngredientCreateInput) {
    try {
      return await this.ingredientsService.create(createIngredientDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:error.message, 
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.ingredientsService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:'Failed to retrieve ingredients',
          message:error.message,
        }, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const ingredient = await this.ingredientsService.findOne(id);
      if (!ingredient) {
        throw new HttpException('Ingredient not found', HttpStatus.NOT_FOUND);
      }
      return ingredient;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Not Found',
          message:error.message,
        }, 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateIngredientDto: Prisma.IngredientUpdateInput) {
    try {
      return await this.ingredientsService.update(id, updateIngredientDto);
      return 'Ingredient Updated';
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:error.message,
        }, 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.ingredientsService.remove(id);
      return 'Ingredient Deleted';
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message:error.message
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('price/low')
  async findLowPriceIngredients() {
    console.log('Received request for low price ingredients');
    return this.ingredientsService.findLowPriceIngredients();
  }

  @Get('price/high')
  async findHighPriceIngredients() {
    console.log('Received request for high price ingredients');
    return this.ingredientsService.findHighPriceIngredients();
  }
}
