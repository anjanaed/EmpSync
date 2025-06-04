import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { MealTypeService } from './meal-type.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('meal-types')
export class MealTypeController {
  constructor(private readonly mealTypeService: MealTypeService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN')
  async toggleDefault(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealTypeService.toggleIsDefault(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('timeupdate/:id/:index')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.mealTypeService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
