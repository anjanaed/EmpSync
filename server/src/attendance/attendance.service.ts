import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createAttendanceDto: Prisma.AttendanceCreateInput) {
    return this.databaseServices.attendance.create({ data: createAttendanceDto })
  }

  async findAll() {
    return this.databaseServices.attendance.findMany({});
  }

  async findOne(id: string) {
    return this.databaseServices.attendance.findUnique({
      where:{
        id,
      },
    });
  }

  async update(id: string, updateAttendanceDto: Prisma.AttendanceUpdateInput) {
    return this.databaseServices.attendance.update({
      where: {
        id,
      },
      data: updateAttendanceDto,
    })
  }

  async remove(id: string) {
    return this.databaseServices.attendance.delete({
      where:{
        id,
      },
    })
  }
}
