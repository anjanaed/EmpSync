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
      if (!createOrderDto.orgId && createOrderDto.employeeId) {
        const user = await this.databaseService.user.findUnique({
          where: { id: createOrderDto.employeeId },
          select: { organizationId: true },
        });
        if (!user) {
          throw new HttpException(
            'User not found for order',
            HttpStatus.BAD_REQUEST,
          );
        }
        createOrderDto.orgId = user.organizationId;
      }

      // Attempt to create an order in the database
      return await this.databaseService.order.create({ data: createOrderDto });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException(
          'Order Number must be unique',
          HttpStatus.CONFLICT,
        );
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

  async getMealOrderAnalytics(orgId: string) {
    try {
      // Step 1: Get all orders for the organization
      const orders = await this.databaseService.order.findMany({
        where: { orgId },
      });

      if (!orders || orders.length === 0) {
        return {
          orgId,
          totalOrders: 0,
          mealAnalytics: [],
        };
      }

      // Step 2: Parse meals from all orders and count occurrences
      const mealCounts = new Map<number, number>();
      let totalMealOrders = 0;

      orders.forEach((order) => {
        if (order.meals && Array.isArray(order.meals)) {
          order.meals.forEach((mealString) => {
            // Parse "mealId:quantity" format
            const [mealIdStr, quantityStr] = mealString.split(':');
            const mealId = parseInt(mealIdStr);
            const quantity = parseInt(quantityStr) || 1;

            if (!isNaN(mealId)) {
              const currentCount = mealCounts.get(mealId) || 0;
              mealCounts.set(mealId, currentCount + quantity);
              totalMealOrders += quantity;
            }
          });
        }
      });

      // Step 3: Get meal details for all meal IDs
      const mealIds = Array.from(mealCounts.keys());
      const meals = await this.databaseService.meal.findMany({
        where: {
          id: { in: mealIds },
          orgId, // Ensure meals belong to the same organization
        },
        select: {
          id: true,
          nameEnglish: true,
        },
      });

      // Step 4: Create analytics response
      const mealAnalytics = meals.map((meal) => {
        const orderCount = mealCounts.get(meal.id) || 0;
        const percentage =
          totalMealOrders > 0
            ? Math.round((orderCount / totalMealOrders) * 100 * 100) / 100 // Round to 2 decimal places
            : 0;

        return {
          mealId: meal.id,
          mealName: meal.nameEnglish,
          orderCount,
          percentage,
        };
      });

      // Step 5: Sort by order count (descending)
      mealAnalytics.sort((a, b) => b.orderCount - a.orderCount);

      return {
        orgId,
        totalOrders: orders.length,
        totalMealOrders,
        mealAnalytics,
      };
    } catch (err) {
      throw new HttpException(
        `Error fetching meal analytics: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
