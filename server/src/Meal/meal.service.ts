import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MealService {
  constructor(private  readonly databaseService : DatabaseService){}

  async create(createMealDto: Prisma.MealCreateInput) {
    return this.databaseService.meal.create({data: createMealDto})
  }

  async findAll() {
    return this.databaseService.meal.findMany({});
  }

  async findOne(id: number) {
    return this.databaseService.meal.findUnique({
      where:{
        id,
      }
    });
  }

  async update(id: number, UpdateMealDto: Prisma.MealUpdateInput) {
    return this.databaseService.meal.update({
      where:{
        id,
      },
      data: UpdateMealDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.meal.delete({
      where:{id},
    });
  }
}
