import { Controller, Get, Query } from '@nestjs/common';
import { OrderTabFingerprintService } from './order-tab-fingerprint.service';

@Controller('order-tab-fingerprint')
export class OrderTabFingerprintController {
  constructor(private readonly orderTabFingerprintService: OrderTabFingerprintService) {}

  @Get('by-thumbid')
  async getUserByThumbId(@Query('thumbId') thumbId: string) {
    return this.orderTabFingerprintService.getUserByThumbId(thumbId);
  }

//   @Get('by-userid')
//   async getThumbIdByUserId(@Query('userId') userId: string) {
//     return this.orderTabFingerprintService.getThumbIdByUserId(userId);
//   }

//   @Get()
//   async getAllUsers() {
//     return this.orderTabFingerprintService.getAllUsers();
//   }
}
