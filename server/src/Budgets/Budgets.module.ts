import { Module } from '@nestjs/common';
import { BudgetService } from './Budgets.service';
import { BudgetsController } from './Budgets.controller';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetService],
})
export class BudgetsModule {}
