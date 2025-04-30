import { Controller, Post, Get, Query, Param, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const tokens = await this.authService.loginWithAuth0(email, password);
      return tokens;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to authenticate');
    }
  }

  @Get('resolve-email/:employeeId')
  async resolveEmail(@Param('employeeId') employeeId: string) {
    if (!employeeId) {
      throw new BadRequestException('Employee ID is required');
    }

    try {
      const email = await this.authService.getEmailFromEmployeeID(employeeId);
      if (!email) {
        throw new NotFoundException('User not found');
      }
      return { email };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to resolve email');
    }
  }
}