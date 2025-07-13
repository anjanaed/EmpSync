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
import { AnyAuthGuard } from 'src/core/authentication/any-auth.guard';


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
  @UseGuards(AnyAuthGuard)

  async getOrganizations() {
    return this.superAdminService.getOrganizations();
  }

  @Get('organizations/:id')
  @UseGuards(AnyAuthGuard)
  async getOrganizationById(@Param('id') id: string) {
    return this.superAdminService.getOrganizationById(id);
  }

  @Get('admins/:orgId')
  //   @UseGuards(AuthGuard('superadmin-jwt'))
  async getByOrg(@Param('orgId') orgId: string) {
    return this.superAdminService.getByOrg(orgId);
  }

  @Put('organizations/:id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: Prisma.OrganizationUpdateInput,
  ) {
    return this.superAdminService.updateOrganization(id, data);
  }

  @Delete('organizations/:id')
  async deleteOrganization(@Param('id') id: string) {
    return this.superAdminService.deleteOrganization(id);
  }

  // User endpoints
  @Post('users')
  async createUser(@Body() data: Prisma.UserCreateInput) {
    return this.superAdminService.createUser(data);
  }

  @Get('users')
  async getUsers() {
    return this.superAdminService.getUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.superAdminService.getUserById(id);
  }

  @Get('users/:id/permissions')
  async getPermissionsByUserId(@Param('id') id: string) {
    return this.superAdminService.getPermissionsByUserId(id);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    return this.superAdminService.updateUser(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.superAdminService.deleteUser(id);
  }

  // Permission endpoints
  @Post('permissions')
  async createPermission(@Body() data: Prisma.PermissionCreateInput) {
    return this.superAdminService.createPermission(data);
  }

  @Get('permissions')
  async getPermissions() {
    return this.superAdminService.getPermissions();
  }

  @Get('permissions/:id')
  async getPermissionById(@Param('id') id: string) {
    return this.superAdminService.getPermissionById(id);
  }

  @Put('permissions/:id')
  async updatePermission(
    @Param('id') id: string,
    @Body() data: Prisma.PermissionUpdateInput,
  ) {
    return this.superAdminService.updatePermission(id, data);
  }

  @Delete('permissions/:id')
  async deletePermission(@Param('id') id: string) {
    return this.superAdminService.deletePermission(id);
  }
}
