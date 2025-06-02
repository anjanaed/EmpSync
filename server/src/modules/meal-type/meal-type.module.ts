import { Module } from '@nestjs/common';
import { MealTypeService } from './meal-type.service';
import { MealTypeController } from './meal-type.controller';

@Module({
  providers: [MealTypeService],
  controllers: [MealTypeController]
})
export class MealTypeModule {}
