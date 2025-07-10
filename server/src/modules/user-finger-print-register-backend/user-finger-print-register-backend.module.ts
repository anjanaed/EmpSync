import { Module } from '@nestjs/common';
import { UserFingerPrintRegisterBackendController } from './user-finger-print-register-backend.controller';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

@Module({
  controllers: [UserFingerPrintRegisterBackendController],
  providers: [UserFingerPrintRegisterBackendService],
})
export class UserFingerPrintRegisterBackendModule {}
