import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { MealTypeService } from './meal-type.service';

@Controller('meal-types')
export class MealTypeController {
  constructor(private readonly mealTypeService: MealTypeService) {}

  @Get()
  async findAll() {
    try {
      return await this.mealTypeService.findAll();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('defaults')
  async findDefaults() {
    try {
      return await this.mealTypeService.findDefaults();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('fetch')
  async fetchTodayAndTomorrow() {
    try {
      return await this.mealTypeService.findTodayAndTomorrow();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('by-date/:date')
  async findByDateOrDefault(@Param('date') date: string) {
    try {
      return await this.mealTypeService.findByDateOrDefault(date);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealTypeService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      time?: string;
      isDefault?: boolean;
      date: string;
    },
  ) {
    try {
      return await this.mealTypeService.create(
        body.name,
        body.time,
        body.isDefault,
        body.date,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id/toggle-default')
  async toggleDefault(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealTypeService.toggleIsDefault(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('timeupdate/:id/:index')
  async patchTimeElement(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number, // 0 for first, 1 for second
    @Body() body: { newTime: string },
  ) {
    try {
      if (index !== 0 && index !== 1) {
        throw new BadRequestException('Index must be 0 or 1');
      }
      return await this.mealTypeService.patchTimeElement(
        id,
        index,
        body.newTime,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; time?: string; isDefault?: boolean },
  ) {
    try {
      return await this.mealTypeService.update(id, body);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealTypeService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
