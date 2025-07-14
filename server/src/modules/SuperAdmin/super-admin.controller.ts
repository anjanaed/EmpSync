import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SuperAdminService } from './super-admin.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}
  // Organization endpoints
  @Post('organizations')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async createOrganization(@Body() data: Prisma.OrganizationCreateInput) {
    return this.superAdminService.createOrganization(data);
  }

  @Get('organizations')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getOrganizations() {
    return this.superAdminService.getOrganizations();
  }

  @Get('organizations/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getOrganizationById(@Param('id') id: string) {
    return this.superAdminService.getOrganizationById(id);
  }

  @Get('admins/:orgId')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getByOrg(@Param('orgId') orgId: string) {
    return this.superAdminService.getByOrg(orgId);
  }

  @Put('organizations/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: Prisma.OrganizationUpdateInput,
  ) {
    return this.superAdminService.updateOrganization(id, data);
  }

  @Delete('organizations/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async deleteOrganization(@Param('id') id: string) {
    return this.superAdminService.deleteOrganization(id);
  }

  // User endpoints
  @Post('users')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async createUser(@Body() data: Prisma.UserCreateInput) {
    return this.superAdminService.createUser(data);
  }

  @Get('users')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getUsers() {
    return this.superAdminService.getUsers();
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getUserById(@Param('id') id: string) {
    return this.superAdminService.getUserById(id);
  }

  @Get('users/:id/permissions')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getPermissionsByUserId(@Param('id') id: string) {
    return this.superAdminService.getPermissionsByUserId(id);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async updateUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    return this.superAdminService.updateUser(id, data);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async deleteUser(@Param('id') id: string) {
    return this.superAdminService.deleteUser(id);
  }

  // Permission endpoints
  @Post('permissions')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async createPermission(@Body() data: Prisma.PermissionCreateInput) {
    return this.superAdminService.createPermission(data);
  }

  @Get('permissions')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getPermissions() {
    return this.superAdminService.getPermissions();
  }

  @Get('permissions/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async getPermissionById(@Param('id') id: string) {
    return this.superAdminService.getPermissionById(id);
  }

  @Put('permissions/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async updatePermission(
    @Param('id') id: string,
    @Body() data: Prisma.PermissionUpdateInput,
  ) {
    return this.superAdminService.updatePermission(id, data);
  }

  @Delete('permissions/:id')
  @UseGuards(AuthGuard('superadmin-jwt'))
  async deletePermission(@Param('id') id: string) {
    return this.superAdminService.deletePermission(id);
  }
}
