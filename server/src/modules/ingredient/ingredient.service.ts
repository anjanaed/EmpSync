import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput) {
    try {
      const newIngredient = await this.databaseServices.ingredient.create({
        data: createIngredientDto,
      });

      return newIngredient;
    } catch (error) {
      console.error('Ingredient creation failed:', error);
      throw new HttpException(
        'Failed to create ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    const ingredients = await this.databaseServices.ingredient.findMany({});
    if (!ingredients || ingredients.length === 0) {
      throw new HttpException('No Ingredients', HttpStatus.NOT_FOUND);
    }
    return ingredients;
  }

  async findOne(id: number) {
    // id is converted to number
    const parsedId = parseInt(id.toString(), 10);
    
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid ingredient ID', HttpStatus.BAD_REQUEST);
    }

    const ingredient = await this.databaseServices.ingredient.findUnique({
      where: { id: parsedId }
    });

    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: Prisma.IngredientUpdateInput) {
    // The findOne method will now handle the id parsing
    const ingredient = await this.findOne(id);
    
    return this.databaseServices.ingredient.update({
      where: { id: parseInt(id.toString(), 10) },
      data: updateIngredientDto,
    });
  }

  async remove(id: number) {
    // The findOne method already handles ID validation and type conversion
    const ingredient = await this.findOne(id);
    
    try {
      // First delete all related MealIngredient records
      await this.databaseServices.mealIngredient.deleteMany({
        where: {
          ingredientId: parseInt(id.toString(), 10)
        }
      });

      // Then delete the ingredient
      return await this.databaseServices.ingredient.delete({
        where: { id: parseInt(id.toString(), 10) },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to delete ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByOrgId(orgId: string) {
    if (!orgId || typeof orgId !== 'string') {
      throw new HttpException('Invalid organization ID', HttpStatus.BAD_REQUEST);
    }

    const ingredients = await this.databaseServices.ingredient.findMany({
      where: {
        orgId: orgId,
      },
    });

    if (!ingredients || ingredients.length === 0) {
      throw new HttpException('No ingredients found for the organization', HttpStatus.NOT_FOUND);
    }

    return ingredients;
  }
}