import { Controller, Delete, Get, Param,Query } from '@nestjs/common';
import { HrFingerprintsService } from './hr-fingerprints.service';

@Controller('hr-fingerprints')
export class HrFingerprintsController {
  constructor(private readonly hrFingerprintsService: HrFingerprintsService) {}

  @Get()
  async getAllFingerprints(@Query('orgId') orgId?: string) {
    return this.hrFingerprintsService.getAllFingerprints(orgId);
  }

  @Get('thumbids/:empId')
  async getThumbidsByEmpId(@Param('empId') empId: string) {
    return this.hrFingerprintsService.getThumbidsByEmpId(empId);
  }

  @Delete('fingerprint/:thumbid')
  async deleteFingerprintByThumbid(@Param('thumbid') thumbid: string) {
    return this.hrFingerprintsService.deleteFingerprintByThumbid(thumbid);
  }

  @Get('delete-by-empid/:empId')
  async deleteFingerprintsByEmpId(@Param('empId') empId: string) {
    return this.hrFingerprintsService.deleteFingerprintsByEmpId(empId);
  }

  @Get('users/fingerprint-status')
  async getAllUsersWithFingerprintStatus() {
    return this.hrFingerprintsService.getAllUsersWithFingerprintStatus();
  }

@Get('users/fingerprint-details')
async getAllUsersWithFingerprintDetails(@Query('orgId') orgId?: string) {
  return this.hrFingerprintsService.getAllUsersWithFingerprintDetails(orgId);
}
}
