import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetsController } from './budget.controller';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetService],
})
export class BudgetsModule {}
