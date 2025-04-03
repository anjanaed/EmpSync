import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Prisma } from '@prisma/client';
import { threadId } from 'worker_threads';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createIngredientDto: Prisma.IngredientCreateInput | Prisma.IngredientCreateInput[]) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get('price/low')
  async findLowPriceIngredients() {
    console.log('Received request for low price ingredients');
    return this.ingredientsService.findLowPriceIngredients();
  }

  @Get('stats')
  async getIngredientStats() {
    return this.ingredientsService.getIngredientStats();
  }

  @Get('advanced-stats')
  async getAdvancedIngredientStats() {
    return this.ingredientsService.getAdvancedIngredientStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientDto: Prisma.IngredientUpdateInput) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}
