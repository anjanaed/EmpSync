import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaveApplicationService {
  constructor(private readonly databaseService: DatabaseService) {

  }

  async create(createLeaveApplicationDto: Prisma.LeaveApplicationCreateInput) {
    return this.databaseService.leaveApplication.create({data: createLeaveApplicationDto});
  }
  async findAll() {
    return this.databaseService.leaveApplication.findMany({})
  }


  async findOne(id: number) {
    return this.databaseService.leaveApplication.findUnique({
      where: {
        id,
      },
      
    });
  }

  async update(id: number, updateLeaveApplicationDto: Prisma.LeaveApplicationUpdateInput) {
    return this.databaseService.leaveApplication.update({
      where: {
        id,
      },
      data: updateLeaveApplicationDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.leaveApplication.delete({
      where: {id},
   });
  }
}
