import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class MealService {
  constructor(private readonly databaseService: DatabaseService) {}

  
  async createWithIngredients(
    mealData: Omit<Prisma.MealCreateInput, 'ingredients'>,
    ingredients: Array<{ ingredientId: number }>,
    orgId?: string,
  ) {
    try {
      const data: any = {
        ...mealData,
        organizationId: orgId || undefined,
      };
      if (ingredients && ingredients.length > 0) {
        data.ingredients = {
          create: ingredients.map((ing) => ({
            ingredient: {
              connect: { id: ing.ingredientId },
            },
          })),
        };
      }
      const result = await this.databaseService.meal.create({
        data,
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to create meal: ${error.message}`);
    }
  }


  async findOneWithIngredients(id: number, orgId?: string) {
    try {
      return await this.databaseService.meal.findFirst({
        where: {
          id,
          orgid: orgId || undefined,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meal');
    }
  }


  async findAllWithIngredients(orgId?: string) {
    try {
      return await this.databaseService.meal.findMany({
        where: {
          orgid : orgId || undefined,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve meals');
    }
  }

  async updateWithIngredients(
    id: number,
    mealData: Omit<Prisma.MealUpdateInput, 'ingredients'>,
    ingredients?: Array<{ ingredientId: number }>,
    orgId?: string,
  ) {
    try {
      
      const meal = await this.databaseService.meal.findFirst({
        where: {
          id,
          orgid : orgId || undefined,
        },
      });
      if (!meal) {
        throw new NotFoundException('Meal not found');
      }

      
      return await this.databaseService.$transaction(async (prisma) => {
        if (ingredients && ingredients.length > 0) {
          await prisma.mealIngredient.deleteMany({
            where: { mealId: id },
          });

          for (const ing of ingredients) {
            await prisma.mealIngredient.create({
              data: {
                mealId: id,
                ingredientId: ing.ingredientId,
              },
            });
          }
        }

        const updatedMeal = await prisma.meal.update({
          where: { id },
          data: mealData,
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });

        return updatedMeal;
      });
    } catch (error) {
      throw new BadRequestException(`Failed to update meal: ${error.message}`);
    }
  }

  async remove(id: number, orgId?: string) {
    try {
      const meal = await this.databaseService.meal.findFirst({
        where: {
          id,
           orgid : orgId || undefined,
        },
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