import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.UserCreateInput) {
    try {
      await this.databaseService.user.create({ data: dto });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException('Id, Name must be unique', HttpStatus.CONFLICT);
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const users = await this.databaseService.user.findMany();
      if (users) {
        return users;
      } else {
        throw new HttpException('No Users', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        return user;
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, dto: Prisma.UserUpdateInput) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        await this.databaseService.user.update({
          where: {
            id,
          },
          data: dto,
        });
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        await this.databaseService.user.delete({
          where: { id },
        });
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
