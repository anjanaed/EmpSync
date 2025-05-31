import { Module } from '@nestjs/common';`
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  controllers: [StockController],
  providers: [StockService],
})

export class StockModule {}