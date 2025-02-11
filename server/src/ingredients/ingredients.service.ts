import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput) {
    return this.databaseServices.ingredient.create({ data: createIngredientDto })
  }

  async findAll() {
    return this.databaseServices.ingredient.findMany({});
  }

  async findOne(id: string) {
    return this.databaseServices.ingredient.findUnique({
      where:{
        id,
      },
    });
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    return this.databaseServices.ingredient.update({
      where: {
        id,
      },
      data: updateIngredientDto,
    })
  }

  async remove(id: string) {
    return this.databaseServices.ingredient.delete({
      where:{
        id,
      },
    })
  }
}
