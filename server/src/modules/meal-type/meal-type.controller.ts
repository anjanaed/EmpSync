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
  Query,
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
  async findAll(@Query('orgId') orgId?: string) {
    try {
      return await this.mealTypeService.findAll(orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('defaults')
  async findDefaults(@Query('orgId') orgId?: string) {
    try {
      return await this.mealTypeService.findDefaults(orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('fetch')
  async fetchTodayAndTomorrow(@Query('orgId') orgId?: string) {
    try {
      return await this.mealTypeService.findTodayAndTomorrow(orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('by-date/:date')
  async findByDateOrDefault(
    @Param('date') date: string,
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.findByDateOrDefault(date, orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.findOne(id, orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
  async create(
    @Body()
    body: {
      name: string;
      time?: string;
      isDefault?: boolean;
      date: string;
    },
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.create(
        body.name,
        body.time,
        body.isDefault,
        body.date,
        orgId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id/toggle-default')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
  async toggleDefault(
    @Param('id', ParseIntPipe) id: number,
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.toggleIsDefault(id, orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('timeupdate/:id/:index')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
  async patchTimeElement(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
    @Body() body: { newTime: string },
    @Query('orgId') orgId?: string,
  ) {
    try {
      if (index !== 0 && index !== 1) {
        throw new BadRequestException('Index must be 0 or 1');
      }
      return await this.mealTypeService.patchTimeElement(
        id,
        index,
        body.newTime,
        orgId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; time?: string; isDefault?: boolean },
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.update(id, body, orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Single soft delete endpoint - using DELETE for semantic clarity
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('KITCHEN_ADMIN', 'HR_ADMIN')
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.mealTypeService.softDelete(id, orgId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  

  
}