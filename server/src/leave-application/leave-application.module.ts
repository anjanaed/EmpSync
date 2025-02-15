import { Module } from '@nestjs/common';
import { LeaveApplicationService } from './leave-application.service';
import { LeaveApplicationController } from './leave-application.controller';

@Module({
  controllers: [LeaveApplicationController],
  providers: [LeaveApplicationService],
})
export class LeaveApplicationModule {}
