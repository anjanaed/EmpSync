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
import { MealsServingModule } from './modules/meals-serving/meals-serving.module';
import { MealTypeModule } from './modules/meal-type/meal-type.module';
import { SuperAdminModule } from './modules/SuperAdmin/super-admin.module';
import { SuperAdminAuthModule } from './core/super-admin-auth/superadmin-auth.module';
import { UserFingerPrintRegisterBackendModule } from './modules/user-finger-print-register-backend/user-finger-print-register-backend.module';
import { UserFingerPrintRegisterBackendService } from './modules/user-finger-print-register-backend/user-finger-print-register-backend.service';
import { UserFingerPrintRegisterBackendController } from './modules/user-finger-print-register-backend/user-finger-print-register-backend.controller';
import { HrFingerprintsModule } from './modules/hr-fingerprints/hr-fingerprints.module';

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
    SuperAdminAuthModule,
    ScheduleModule,
    MealTypeModule,
    AdjustmentModule,
    IndiAdjustmentModule,
    PayeTaxModule,
    AuthModule,
    MealsServingModule,
    SuperAdminModule,
    UserFingerPrintRegisterBackendModule,
    HrFingerprintsModule,
  ],
  controllers: [AppController, UserFingerPrintRegisterBackendController],
  providers: [AppService, UserFingerPrintRegisterBackendService],
})
export class AppModule {}
