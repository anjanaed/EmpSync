import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredient.service';
import { IngredientsController } from './ingredient.controller';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
