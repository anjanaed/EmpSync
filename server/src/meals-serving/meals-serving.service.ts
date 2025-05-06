import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MealsServingService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Retrieve a meal by its ID with related ingredients
  async findMealsServingByMealId(id: number) {
    try {
      const meal = await this.databaseService.meal.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true, // Include related ingredient details
            },
          },
        },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found');
      }

      return meal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve meal: ${error.message}`);
    }
  }
}