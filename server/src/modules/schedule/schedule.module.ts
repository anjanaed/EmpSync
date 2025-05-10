import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduledMealCronService } from './scheduled-meal-cron/scheduled-meal-cron.service';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduledMealCronService],
})
export class ScheduleModule {}
