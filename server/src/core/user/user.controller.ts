import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Param,
  Query,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../authentication/roles.guard';
import { Roles } from '../authentication/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async create(@Body() dto: Prisma.UserCreateInput) {
    try {
      await this.userService.create(dto);
      return 'User Registered Successfully';
    } catch (err) {
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

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    try {
      return await this.userService.findAll(search, role);
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

  @Get(':id')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(@Param('id') id: string) {
    try {
      return await this.userService.findOne(id);
    } catch (err) {
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

  @Get('/fetchrole/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findRole(@Param('id') id: string) {
    try {
      return await this.userService.fetchRole(id);
    } catch (err) {
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

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async update(@Param('id') id: string, @Body() dto: Prisma.UserUpdateInput) {
    try {
      await this.userService.update(id, dto);
      return 'User Updated';
    } catch (err) {
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

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')
  async delete(@Param('id') id: string) {
    try {
      await this.userService.delete(id);
      return 'User Deleted';
    } catch (err) {
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
