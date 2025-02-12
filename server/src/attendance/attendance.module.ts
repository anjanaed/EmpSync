import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}