import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MealModule } from './Meal/meal.module';
import { IngredientsModule } from './ingredient/ingredient.module';
import { BudgetsModule } from './budget/budget.module';
import { PayrollModule } from './payroll/payroll.module';
import { AttendanceModule } from './attendance/attendance.module';
import {OrdersModule} from './orders/orders.module'
import { ScheduleModule } from './schedule/schedule.module';
import { AdjustmentModule } from './SalaryAdjustments/adjustment.module';
import { IndiAdjustmentModule } from './IndividualSalaryAdjustments/inAdjustment.module';
import { PayeTaxModule } from './PayeTaxSlab/PayeTax.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ReportModule } from './Reports/reports.module';







@Module({

  imports: [
    NestScheduleModule.forRoot(), 
    DatabaseModule,
    UserModule,
    IngredientsModule,
    BudgetsModule,
    MealModule,
    PayrollModule,
    AttendanceModule,
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


