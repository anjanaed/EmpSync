import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

@Controller('user-finger-print-register-backend')
export class UserFingerPrintRegisterBackendController {
  constructor(private readonly userFingerPrintRegisterBackendService: UserFingerPrintRegisterBackendService) {}

  /**
   * GET /user-finger-print-register-backend/user-by-passkey?passkey=1234
   * Returns: { id, name } or 404 if not found
   */
  @Get('user-by-passkey')
  async getUserByPasskey(@Query('passkey') passkey: string) {
    if (!passkey || isNaN(Number(passkey))) {
      throw new BadRequestException('passkey must be a number');
    }
    const user = await this.userFingerPrintRegisterBackendService.getUserByPasskey(Number(passkey));
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
