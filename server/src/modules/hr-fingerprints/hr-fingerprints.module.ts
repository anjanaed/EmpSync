import { Module } from '@nestjs/common';
import { HrFingerprintsService } from './hr-fingerprints.service';
import { HrFingerprintsController } from './hr-fingerprints.controller';

@Module({
  providers: [HrFingerprintsService],
  controllers: [HrFingerprintsController]
})
export class HrFingerprintsModule {}
