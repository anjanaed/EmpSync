import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
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

  @Get('price/high')
  async findHighPriceIngredients() {
    console.log('Received request for high price ingredients');
    return this.ingredientsService.findHighPriceIngredients();
  }

  @Get('optimal')
  @ApiOperation({ summary: 'Get optimal ingredient list based on budget' })
  @ApiQuery({ 
    name: 'budget', 
    required: true, 
    type: Number,
    description: 'The maximum budget for ingredients' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an optimal list of ingredients within the specified budget'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid budget provided'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No ingredients found within budget'
  })
  async getOptimalIngredients(@Query('budget') budget: number) {
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      throw new BadRequestException('Valid budget is required');
    }
    
    const result = await this.ingredientsService.findOptimalIngredients(Number(budget));
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new NotFoundException('No ingredients found within the specified budget');
    }
    
    return result;
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
