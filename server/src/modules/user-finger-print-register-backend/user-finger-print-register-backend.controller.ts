import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

@Controller('user-finger-print-register-backend')
export class UserFingerPrintRegisterBackendController {
  /**
   * GET /user-finger-print-register-backend/all-fingerprints
   * Returns: Array of all fingerprints
   */
  @Get('all-fingerprints')
  async getAllFingerprints() {
    return this.userFingerPrintRegisterBackendService.getAllFingerprints();
  }
  constructor(private readonly userFingerPrintRegisterBackendService: UserFingerPrintRegisterBackendService) {}

  /**
   * GET /user-finger-print-register-backend/user-by-passkey?passkey=1234
   * Returns: { id, name, organizationId } or 404 if not found
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

  /**
   * POST /user-finger-print-register-backend/fingerprint
   * Body: { thumbid: string, empId: string }
   * Returns: created Fingerprint or error
   */
  @Post('fingerprint')
  async createFingerprint(@Body() body: { thumbid: string; empId: string }) {
    if (!body.thumbid || !body.empId) {
      throw new BadRequestException('thumbid and empId are required');
    }
    return this.userFingerPrintRegisterBackendService.createFingerprint(body.thumbid, body.empId);
  }

  /**
   * POST /user-finger-print-register-backend/register
   * Body: { thumbid: string, empId: string }
   * Returns: created Fingerprint or error
   */
  @Post('register')
  async registerFingerprint(@Body() body: { thumbid: string; empId: string }) {
    if (!body.thumbid || !body.empId) {
      throw new BadRequestException('thumbid and empId are required');
    }
    return this.userFingerPrintRegisterBackendService.createFingerprint(body.thumbid, body.empId);
  }

  /**
   * GET /user-finger-print-register-backend/fingerprint?thumbid=abcd
   * Returns: Fingerprint data or 404 if not found
   */
  @Get('fingerprint')
  async getFingerprintByThumbid(@Query('thumbid') thumbid: string) {
    if (!thumbid) {
      throw new BadRequestException('thumbid is required');
    }
    const fingerprint = await this.userFingerPrintRegisterBackendService.getFingerprintByThumbid(thumbid);
    if (!fingerprint) {
      throw new BadRequestException('Fingerprint not found');
    }
    return fingerprint;
  }
}
