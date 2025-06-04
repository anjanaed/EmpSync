import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Post,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PayeTaxService } from './paye-tax.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';

@Controller('paye')
export class PayeTaxController {
  constructor(private readonly payeTaxService: PayeTaxService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async create(@Body() dto: Prisma.PayeTaxSlabCreateInput) {
    try {
      return await this.payeTaxService.create(dto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create PAYE tax slab',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async findAll() {
    try {
      return await this.payeTaxService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch PAYE tax slabs',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async findOne(@Param('id') id: number) {
    try {
      const tax = await this.payeTaxService.findOne(id);
      if (!tax) {
        throw new HttpException('Tax record not found', HttpStatus.NOT_FOUND);
      }
      return tax;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Failed to fetch PAYE tax slab',
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async update(@Body() dto: Prisma.PayeTaxSlabCreateManyInput[]) {
    try {
      return await this.payeTaxService.update(dto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update PAYE tax slabs',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async remove(@Param('id') id: string) {
    try {
      return await this.payeTaxService.remove(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete PAYE tax slab',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
