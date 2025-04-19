import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
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

  @Get('stats')
  async getIngredientStats() {
    return this.ingredientsService.getIngredientStats();
  }

  @Get('advanced-stats')
  async getAdvancedIngredientStats() {
    return this.ingredientsService.getAdvancedIngredientStats();
  }

  @Get('stats/monthly')
  getMonthlyStats(@Query('year') year?: string) {
    return this.ingredientsService.getMonthlyIngredientStats(year ? parseInt(year) : undefined);
  }

  @Get('optimized')
  async getOptimizedIngredients() {
    return this.ingredientsService.getOptimizedIngredients();
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
