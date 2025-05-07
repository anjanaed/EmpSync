import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './core/user/user.module';
import { MealModule } from './modules/meal/meal.module';
import { IngredientsModule } from './modules/ingredient/ingredient.module';
import { BudgetsModule } from './modules/budget/budget.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { OrdersModule } from './modules/order/order.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AdjustmentModule } from './modules/salary-adjustment/adjustment.module';
import { IndiAdjustmentModule } from './modules/individual-salary-adjustment/in-adjustment.module';
import { PayeTaxModule } from './modules/paye-tax-slab/paye-tax.module';
import { AuthModule } from './core/authentication/auth.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    DatabaseModule,
    UserModule,
    IngredientsModule,
    BudgetsModule,
    MealModule,
    PayrollModule,
    OrdersModule,
    BudgetsModule,
    ScheduleModule,
    AdjustmentModule,
    ReportModule,
    IndiAdjustmentModule,
    PayeTaxModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
