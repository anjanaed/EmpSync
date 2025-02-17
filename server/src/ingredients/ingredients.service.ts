import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput) {
    try {
      return await this.databaseServices.ingredient.create({ data: createIngredientDto });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.databaseServices.ingredient.findMany({});
    } catch (error) {
      throw new BadRequestException('Failed to retrieve ingredients');
    }
  }

  async findOne(id: string) {
    try {
      const ingredient = await this.databaseServices.ingredient.findUnique({
        where: { id },
      });
      if (!ingredient) {
        throw new NotFoundException('Ingredient not found');
      }
      return ingredient;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    try {
      return await this.databaseServices.ingredient.update({
        where: { id },
        data: updateIngredientDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.databaseServices.ingredient.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}