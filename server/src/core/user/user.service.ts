import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.UserCreateInput) {
    try {
      if (dto.id == null || dto.name == null || dto.email == null || dto.password == null) {
        throw new HttpException('Id, Name, Email, Password must be filled', HttpStatus.BAD_REQUEST);
      }

      // Generate a unique 6-digit passkey
      let unique = false;
      let passkey: number;
      while (!unique) {
        passkey = Math.floor(100000 + Math.random() * 900000); // 6-digit
        const existing = await this.databaseService.user.findFirst({ where: { passkey } });
        if (!existing) unique = true;
      }
      dto.passkey = passkey;

      await this.databaseService.user.create({ data: dto });
      return passkey;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException(`Id or Email Already Registered`, HttpStatus.CONFLICT);
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(search?:string,role?:string) {
    try {
      const users = await this.databaseService.user.findMany({
        where:{
          name:search?{contains:search,mode:'insensitive'}:undefined,
          role:role||undefined,
        }
      });
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

  async fetchRole(id:string){
    try{
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if(!user){
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
      return user.role;

    }catch(err){
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
