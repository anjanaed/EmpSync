import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
import { IngredientsService } from './ingredient.service';
import { Prisma } from '@prisma/client';

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

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateIngredientDto: Prisma.IngredientUpdateInput) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Get('org/:orgId')
  async getIngredientsByOrgId(@Param('orgId') orgId: string) {
    try {
      return await this.ingredientsService.findByOrgId(orgId);
    } catch (error) {
      throw new HttpException(error.message || 'Server error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ingredientsService.remove(id);
  }
}
