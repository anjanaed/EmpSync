import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createOrderDto: Prisma.OrderCreateInput) {
    try {
      return await this.databaseService.order.create({ data: createOrderDto });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException('Order Number must be unique', HttpStatus.CONFLICT);
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const orders = await this.databaseService.order.findMany();
      if (orders) {
        return orders;
      } else {
        throw new HttpException('No Orders Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id,
        },
      });
      if (order) {
        return order;
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateOrderDto: Prisma.OrderUpdateInput) {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id,
        },
      });
      if (order) {
        return await this.databaseService.order.update({
          where: {
            id,
          },
          data: updateOrderDto,
        });
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id,
        },
      });
      if (order) {
        return await this.databaseService.order.delete({
          where: { id },
        });
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
