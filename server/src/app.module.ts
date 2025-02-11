import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MealModule } from './meal/meal.module';
import { IngredientsModule } from './ingredients/ingredients.module';


@Module({
  imports: [DatabaseModule, UserModule, IngredientsModule, MealModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


