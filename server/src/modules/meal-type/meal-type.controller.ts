import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { MealTypeService } from './meal-type.service';
import { Prisma } from '@prisma/client';

// Controller for handling order-related HTTP requests
@Controller('mealtype')
export class MealTypeController {
  constructor(private readonly mealService: MealTypeService) {}

  // POST endpoint to create a new order
  @Post()
  async create(@Body() createMealTypeDto: Prisma.MealTypeCreateInput) {
    try {
      return await this.mealService.create(createMealTypeDto); // Call service to create order
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
  @Get()
  async findAll() {
    try {
      return await this.mealService.findAll(); // Call service to fetch all orders
    } catch (err) {
      // Handle errors with an INTERNAL_SERVER_ERROR response
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

  @Get('defaults')
async findDefaults() {
  try {
    return await this.mealService.findDefaults();
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
      return await this.mealService.findOne(id); // Call service to fetch order by ID
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
  async update(@Param('id') id: string, @Body() updateDto: Prisma.MealTypeUpdateInput) {
    try {
      return await this.mealService.update(+id, updateDto); // Call service to update order
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
  async remove(@Param('id') id: string) {
    try {
      return await this.mealService.remove(id); // Call service to delete order
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
}