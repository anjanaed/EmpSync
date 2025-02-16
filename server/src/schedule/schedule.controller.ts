import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Prisma } from '@prisma/client';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: Prisma.ScheduledMealCreateInput) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':date')
  findOne(@Param('date') date: string) {
    return this.scheduleService.findOne(date);
  }

  @Patch(':date')
  update(@Param('date') date: string, @Body() updateScheduleDto: Prisma.ScheduledMealUpdateInput) {
  return this.scheduleService.update(date, updateScheduleDto);
}

  @Delete(':date')
  remove(@Param('date') date: string) {
    return this.scheduleService.remove(date);
  }
}
