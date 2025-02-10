import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { IngredientsModule } from './ingredients/ingredients.module';

@Module({
  imports: [DatabaseModule, UserModule, IngredientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


