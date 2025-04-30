import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const tokens = await this.authService.loginWithAuth0(username, password);
      return tokens;
    } catch (error) {
      console.error(error);
    }
  }
}