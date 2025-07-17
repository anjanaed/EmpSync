import { Controller, Get,Post,Body, Param, UseGuards,HttpException,HttpStatus, Request } from '@nestjs/common';
import { SuperAdminAuthService } from './superadmin-auth.service';

@Controller('superadmin')
export class SuperAdminAuthController {
  constructor(private readonly superAdminAuthService: SuperAdminAuthService) {}


  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.superAdminAuthService.superAdminLoginWithAuth0(
        body.email,
        body.password,
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message || 'Authentication failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    @Post('delete')
  
    async remove(@Body() body: { email: string }) {
      try {
        return await this.superAdminAuthService.superAdminDeleteAuth0UserByEmail(body.email);
      } catch (error) {
        throw new HttpException(
          error.response?.data || error.message || 'User Removing failed',
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
}
