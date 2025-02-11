import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MealModule } from './meal/meal.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { PayrollModule } from './payroll/payroll.module';


@Module({
  imports: [DatabaseModule, UserModule, IngredientsModule, MealModule, PayrollModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


