import { Module } from '@nestjs/common';
import { MealTypeService } from './meal-type.service';
import { MealTypeController } from './meal-type.controller';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [ScheduleModule],
  providers: [MealTypeService],
  controllers: [MealTypeController]
})
export class MealTypeModule {}
