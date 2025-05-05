import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MealService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Create a meal with ingredient relationships
  async createWithIngredients(
    mealData: Omit<Prisma.MealCreateInput, 'ingredients'>,
    ingredients: Array<{ ingredientId: number }>
  ) {
    try {
      // Create the meal with nested ingredient relations
      const result = await this.databaseService.meal.create({
        data: {
          ...mealData,
          ingredients: {
            create: ingredients.map(ing => ({
              ingredient: {
                connect: { id: ing.ingredientId }
              }
            }))
          }
        },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
      
      console.log('Created meal:', result); // Add logging
      return result;
    } catch (error) {
      console.error('Database error:', error); // Add error logging
      throw new BadRequestException(`Failed to create meal: ${error.message}`);
    }
  }

 
  // Create method which now will route to createWithIngredients
  async create(createMealDto: Prisma.MealCreateInput) {
    throw new BadRequestException(
      'This method is deprecated. Please use createWithIngredients instead.'
    );
  }

  // Find all meals with their ingredients
  async findAllWithIngredients() {
    try {
      return await this.databaseService.meal.findMany({
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meals');
    }
  }

  // Regular findAll method
  async findAll() {
    try {
      return await this.databaseService.meal.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meals');
    }
  }

  // Find one meal with its ingredients
  async findOneWithIngredients(id: number) {
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
      
      if (!meal) {
        throw new NotFoundException('Meal not found');
      }
      
      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }



  // Update a meal with its ingredient relationships
  async updateWithIngredients(
    id: number,
    mealData: Omit<Prisma.MealUpdateInput, 'ingredients'>,
    ingredients?: Array<{ ingredientId: number }>
  ) {
    try {
      return await this.databaseService.$transaction(async (prisma) => {
        if (ingredients && ingredients.length > 0) {
          await prisma.mealIngredient.deleteMany({
            where: { mealId: id }
          });
          
          for (const ing of ingredients) {
            await prisma.mealIngredient.create({
              data: {
                mealId: id,
                ingredientId: ing.ingredientId,
              }
            });
          }
        }

        const updatedMeal = await prisma.meal.update({
          where: { id },
          data: mealData,
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        });
        
        return updatedMeal;
      });
    } catch (error) {
      throw new BadRequestException(`Failed to update meal: ${error.message}`);
    }
  }

 
  async remove(id: number) {
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: { id }
      });
      
      if (!meal) {
        throw new NotFoundException('Meal not found');
      }
      
      return await this.databaseService.meal.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}