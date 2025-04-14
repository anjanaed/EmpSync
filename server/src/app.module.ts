import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MealModule } from './Meal/meal.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { PayrollModule } from './payroll/payroll.module';
import { AttendanceModule } from './attendance/attendance.module';
import {OrdersModule} from './orders/orders.module'
import { LeaveApplicationModule } from './leave-application/leave-application.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AdjustmentModule } from './SalaryAdjustments/adjustment.module';
import { IndiAdjustmentModule } from './IndividualSalaryAdjustments/inAdjustment.module';




@Module({
  imports: [DatabaseModule, UserModule, IngredientsModule, MealModule, PayrollModule, AttendanceModule,OrdersModule, LeaveApplicationModule,ScheduleModule,AdjustmentModule,IndiAdjustmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


