import { Module } from '@nestjs/common';
import { ScheduledMealService } from './schedule.service';
import { ScheduledMealController } from './schedule.controller';
import { ScheduleCleanupService } from './schedule-cleanup.service';



@Module({
  controllers: [ScheduledMealController],
  providers: [ScheduledMealService,ScheduleCleanupService],
})
export class ScheduleModule {}
