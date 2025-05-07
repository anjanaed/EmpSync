import { Module } from '@nestjs/common';
import { MealsServingService } from './meals-serving.service';
import { MealsServingController } from './meals-serving.controller';

@Module({
  providers: [MealsServingService],
  controllers: [MealsServingController]
})
export class MealsServingModule {}
