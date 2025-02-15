import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeaveApplicationService } from './leave-application.service';
import { Prisma } from '@prisma/client';

@Controller('leave-application')
export class LeaveApplicationController {
  constructor(private readonly leaveApplicationService: LeaveApplicationService) {}

  @Post()
  create(@Body() createLeaveApplicationDto: Prisma.LeaveApplicationCreateInput) {
    return this.leaveApplicationService.create(createLeaveApplicationDto);
  }

  @Get()
  findAll() {
    return this.leaveApplicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveApplicationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveApplicationDto: Prisma.LeaveApplicationUpdateInput) {
    return this.leaveApplicationService.update(+id, updateLeaveApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveApplicationService.remove(+id);
  }
}
