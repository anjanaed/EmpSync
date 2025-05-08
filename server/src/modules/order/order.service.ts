import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

// Service for handling order-related business logic
@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Create a new order
  async create(createOrderDto: Prisma.OrderCreateInput) {
    try {
      // Attempt to create an order in the database
      return await this.databaseService.order.create({ data: createOrderDto });
    } catch (err) {
      // Handle unique constraint violation (e.g., duplicate order number)
      if (err.code === 'P2002') {
        throw new HttpException('Order Number must be unique', HttpStatus.CONFLICT);
      }
      // Handle other errors
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Retrieve all orders
  async findAll() {
    try {
      // Fetch all orders from the database
      const orders = await this.databaseService.order.findMany();
      if (orders && orders.length > 0) {
        return orders; // Return orders if found
      } else {
        throw new HttpException('No Orders Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      // Handle unexpected errors
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Retrieve a single order by ID
  async findOne(id: number) {
    try {
      // Fetch order by unique ID
      const order = await this.databaseService.order.findUnique({
        where: { id },
      });
      if (order) {
        return order; // Return order if found
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      // Handle unexpected errors
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update an existing order
  async update(id: number, updateOrderDto: Prisma.OrderUpdateInput) {
    try {
      // Check if order exists
      const order = await this.databaseService.order.findUnique({
        where: { id },
      });
      if (order) {
        // Update order with new data
        return await this.databaseService.order.update({
          where: { id },
          data: updateOrderDto,
        });
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      // Handle unexpected errors
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete an order by ID
  async remove(id: number) {
    try {
      // Check if order exists
      const order = await this.databaseService.order.findUnique({
        where: { id },
      });
      if (order) {
        // Delete order from database
        return await this.databaseService.order.delete({
          where: { id },
        });
      } else {
        throw new HttpException('Order Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      // Handle errors
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}