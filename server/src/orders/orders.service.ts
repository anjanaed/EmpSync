import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {

  }

  async create(createProductDto: Prisma.OrderCreateInput) {
    return this.databaseService.order.create({data: createProductDto});
  }
  async findAll() {
    return this.databaseService.order.findMany({})
  }


  async findOne(id: number) {
    return this.databaseService.order.findUnique({
      where: {
        id,
      },
      
    });
  }

  async update(id: number, updateProductDto: Prisma.OrderUpdateInput) {
    return this.databaseService.order.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.order.delete({
      where: {id},
   });
  }
}
