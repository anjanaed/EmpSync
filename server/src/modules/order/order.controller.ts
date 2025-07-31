import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

// Controller for handling order-related HTTP requests
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST endpoint to create a new order
  @Post()
  async create(@Body() createOrderDto: Prisma.OrderCreateInput) {
    try {
      return await this.ordersService.create(createOrderDto); // Call service to create order
    } catch (err) {
      // Handle errors with a BAD_REQUEST response
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET endpoint to retrieve all orders
  // @Get()
  // async findAll() {
  //   try {
  //     return await this.ordersService.findAll(); // Call service to fetch all orders
  //   } catch (err) {
  //     // Handle errors with an INTERNAL_SERVER_ERROR response
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: 'Internal Server Error',
  //         message: err.message,
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Get()
  async findAll(
    @Query('orgId') orgId?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    try {
      return await this.ordersService.findAll(orgId, employeeId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET endpoint to retrieve a single order by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.ordersService.findOne(+id); // Call service to fetch order by ID
    } catch (err) {
      // Handle errors with a NOT_FOUND response
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: err.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // PATCH endpoint to update an existing order
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: Prisma.OrderUpdateInput,
  ) {
    try {
      return await this.ordersService.update(+id, updateOrderDto); // Call service to update order
    } catch (err) {
      // Handle errors with a BAD_REQUEST response
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // DELETE endpoint to remove an order by ID
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string) {
    try {
      return await this.ordersService.remove(+id); // Call service to delete order
    } catch (err) {
      // Handle errors with a NOT_FOUND response
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: err.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // GET meal cost for employee within date range
  @Get('meal-cost/:empId')
  async getMealCost(
    @Param('empId') empId: string,
    @Query('orgId') orgId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      // Validate required parameters
      if (!orgId) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'orgId is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!startDate || !endDate) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'startDate and endDate are required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate date format
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'Invalid date format. Use YYYY-MM-DD',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (start > end) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: 'startDate cannot be greater than endDate',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.ordersService.getMealCost(empId, orgId, start, end);
    } catch (err) {
      // If it's already an HttpException, re-throw it
      if (err instanceof HttpException) {
        throw err;
      }
      
      // Handle other errors with INTERNAL_SERVER_ERROR
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/meals')
async getMealOrderAnalytics(@Query('orgId') orgId: string) {
  try {
    if (!orgId) {
      throw new HttpException('orgId is required', HttpStatus.BAD_REQUEST);
    }
    
    return await this.ordersService.getMealOrderAnalytics(orgId);
  } catch (err) {
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: err.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
