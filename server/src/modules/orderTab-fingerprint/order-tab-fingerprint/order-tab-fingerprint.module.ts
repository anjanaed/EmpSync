import { Module } from '@nestjs/common';
import { OrderTabFingerprintController } from './order-tab-fingerprint.controller';
import { OrderTabFingerprintService } from './order-tab-fingerprint.service';
import { DatabaseService } from '../../../database/database.service';

@Module({
  controllers: [OrderTabFingerprintController],
  providers: [OrderTabFingerprintService, DatabaseService],
  exports: [OrderTabFingerprintService],
})
export class OrderTabFingerprintModule {}
