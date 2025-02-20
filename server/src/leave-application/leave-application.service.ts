import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaveApplicationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createLeaveApplicationDto: Prisma.LeaveApplicationCreateInput) {
    try {
      return await this.databaseService.leaveApplication.create({ data: createLeaveApplicationDto });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException('Leave Application must be unique', HttpStatus.CONFLICT);
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const leaveApplications = await this.databaseService.leaveApplication.findMany();
      if (leaveApplications) {
        return leaveApplications;
      } else {
        throw new HttpException('No Leave Applications Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const leaveApplication = await this.databaseService.leaveApplication.findUnique({
        where: {
          id,
        },
      });
      if (leaveApplication) {
        return leaveApplication;
      } else {
        throw new HttpException('Leave Application Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateLeaveApplicationDto: Prisma.LeaveApplicationUpdateInput) {
    try {
      const leaveApplication = await this.databaseService.leaveApplication.findUnique({
        where: {
          id,
        },
      });
      if (leaveApplication) {
        return await this.databaseService.leaveApplication.update({
          where: {
            id,
          },
          data: updateLeaveApplicationDto,
        });
      } else {
        throw new HttpException('Leave Application Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const leaveApplication = await this.databaseService.leaveApplication.findUnique({
        where: {
          id,
        },
      });
      if (leaveApplication) {
        return await this.databaseService.leaveApplication.delete({
          where: { id },
        });
      } else {
        throw new HttpException('Leave Application Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
