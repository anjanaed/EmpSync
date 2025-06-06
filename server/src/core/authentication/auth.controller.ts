import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
// Declares this class as a controller with the base route 'auth'.
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // Maps HTTP POST requests to the 'auth/login' endpoint to this method.
  async login(@Body() body: { username: string; password: string }) {
    try {
      return await this.authService.loginWithAuth0(
        body.username,
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN')

  // Maps HTTP POST requests to the 'auth/delete' endpoint to this method.
  async remove(@Body() body: { email: string }) {
    try {
      return await this.authService.deleteAuth0UserByEmail(body.email);
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message || 'User Removing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
