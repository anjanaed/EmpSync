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
    // If orgId is not provided, fetch it from the User table using employeeId
    if (!(createOrderDto as any).orgId && createOrderDto.employeeId) {
      const user = await this.databaseService.user.findUnique({
        where: { id: createOrderDto.employeeId },
        select: { organizationId: true },
      });
      if (!user) {
        throw new HttpException('User not found for order', HttpStatus.BAD_REQUEST);
      }
      (createOrderDto as any).orgId = user.organizationId;
    }

    // Attempt to create an order in the database
    return await this.databaseService.order.create({ data: createOrderDto });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpException('Order Number must be unique', HttpStatus.CONFLICT);
    }
    throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  }
}

  // Retrieve all orders
  // async findAll() {
  //   try {
  //     // Fetch all orders from the database
  //     const orders = await this.databaseService.order.findMany();
  //     if (orders && orders.length > 0) {
  //       return orders; // Return orders if found
  //     } else {
  //       throw new HttpException('No Orders Found', HttpStatus.NOT_FOUND);
  //     }
  //   } catch (err) {
  //     // Handle unexpected errors
  //     throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async findAll(orgId?: string, employeeId?: string) {
  try {
    const whereClause: any = {};
    
    if (orgId) {
      whereClause.orgId = orgId;
    }
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const orders = await this.databaseService.order.findMany({
      where: whereClause,
    });
    // Instead of throwing, just return empty array
    return orders || [];
  } catch (err) {
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

  async getMealCost(empId: string, orgId: string, startDate: Date, endDate: Date) {
    //set time period
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all orders for the employee within the date range
    const orders = await this.databaseService.order.findMany({
      where: {
        employeeId: empId,
        orgId: orgId,
        orderDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        price: true, 
      },
    });

    // total meal cost
    const totalMealCost = orders.reduce((sum, order) => {
      return sum + (order.price || 0);
    }, 0);

    return {
      mealCost: totalMealCost,
    };
  }

}