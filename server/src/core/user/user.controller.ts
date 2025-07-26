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
  @Put(':id/regenerate-passkey')
  async regeneratePasskey(@Param('id') id: string) {
    try {
      const passkey = await this.userService.regeneratePasskey(id);
      return { passkey };
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
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(@Body() dto: Prisma.UserCreateInput) {
    try {
      const passkey = await this.userService.create(dto);
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
    @Query('orgId') orgId?: string,
  ) {
    try {
      return await this.userService.findAll(search, role, orgId);
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

  @Get('last-empno/:orgId')
  async getLastEmpNo(@Param('orgId') orgId: string) {
    return await this.userService.getLastEmpNoByOrg(orgId);
  }

  @Get('passkey/:passkey')
  async findByPasskey(@Param('passkey') passkey: string) {
    try {
      const passkeyNumber = parseInt(passkey, 10);
      if (isNaN(passkeyNumber)) {
        throw new Error('Invalid passkey format');
      }
      return await this.userService.findByPasskey(passkeyNumber);
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

  @Get(':id/org/:orgId/name')
  // @UseGuards(AuthGuard('jwt'))
  async getUserNameByIdAndOrg(
    @Param('id') id: string,
    @Param('orgId') orgId: string,
  ) {
    try {
      const user = await this.userService.findNameByIdAndOrg(id, orgId);
      if (!user) {
        throw new Error('User not found');
      }
      return { name: user.name };
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
