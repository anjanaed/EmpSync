import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Prisma } from '@prisma/client';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body() createScheduleDto: Prisma.ScheduledMealCreateInput) {
    try {
      return await this.scheduleService.create(createScheduleDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.scheduleService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve scheduled meals',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':date')
  async findOne(@Param('date') date: string) {
    try {
      const scheduledMeal = await this.scheduleService.findOne(date);
      if (!scheduledMeal) {
        throw new HttpException(
          'Scheduled meal not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return scheduledMeal;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':date')
  async update(
    @Param('date') date: string,
    @Body() updateScheduleDto: Prisma.ScheduledMealUpdateInput,
  ) {
    try {
      return await this.scheduleService.update(date, updateScheduleDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':date/confirm')
  async confirm(@Param('date') date: string) {
    try {
      return await this.scheduleService.confirm(date);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Confirmation failed',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':date')
  async remove(@Param('date') date: string) {
    try {
      return await this.scheduleService.remove(date);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}