import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Organization CRUD operations
  async createOrganization(data: Prisma.OrganizationCreateInput) {
    try {
      if (!data.name) {
        throw new BadRequestException('Organization name is required');
      }

      // Fetch last org ID
      let newId: string;
      try {
        const lastId = await this.getLastOrganizationId(); // e.g., "O007"
        const numericPart = parseInt(lastId.replace('O', ''), 10); // -> 7
        const nextId = numericPart + 1;
        newId = 'O' + nextId.toString().padStart(3, '0'); // -> "O008"
      } catch (error) {
        // If no orgs found, start from O001
        if (error instanceof NotFoundException) {
          newId = 'O001';
        } else {
          throw error;
        }
      }

      // Merge ID with data
      const newOrgData: Prisma.OrganizationCreateInput = {
        ...data,
        id: newId,
      };

      return await this.databaseService.organization.create({ data: newOrgData });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Organization with this name already exists');
      }
      throw new BadRequestException('Failed to create organization: ' + error.message);
    }
}


  async getOrganizations() {
    try {
      return await this.databaseService.organization.findMany({
        include: { users: true },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch organizations: ' + error.message);
    }
  }

  async getOrganizationById(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Organization ID is required');
      }
      const organization = await this.databaseService.organization.findUnique({
        where: { id },
        include: { users: true },
      });
      if (!organization) throw new NotFoundException('Organization not found');
      return organization;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch organization: ' + error.message);
    }
  }

  async updateOrganization(id: string, data: Prisma.OrganizationUpdateInput) {
    try {
      if (!id) {
        throw new BadRequestException('Organization ID is required');
      }
      return await this.databaseService.organization.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Organization not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Organization with this name already exists');
      }
      throw new BadRequestException('Failed to update organization: ' + error.message);
    }
  }

  async deleteOrganization(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Organization ID is required');
      }
      return await this.databaseService.organization.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Organization not found');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete organization with existing users');
      }
      throw new BadRequestException('Failed to delete organization: ' + error.message);
    }
  }

  async getByOrg(orgId: string) {
    try {
      const users = await this.databaseService.user.findMany({
        where: {
          organizationId: orgId,
          role: {
            in: ['KITCHEN_ADMIN', 'HR_ADMIN'],
          },
        },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
          organizationId: true,
        },
      });
      if (!users || users.length === 0) {
        throw new NotFoundException('No Administrators Found For This Organization');
      }
      return users;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLastOrganizationId(): Promise<string> {
    try {
      const lastOrg = await this.databaseService.organization.findFirst({
        orderBy: {
          createdAt: 'desc', // Or use `id: 'desc'` if no createdAt field
        },
        select: {
          id: true,
        },
      });

      if (!lastOrg) {
        throw new NotFoundException('No organizations found');
      }

      return lastOrg.id;
    } catch (error) {
      throw new BadRequestException('Failed to fetch last organization ID: ' + error.message);
    }
  }


  // User CRUD operations
  async createUser(data: Prisma.UserCreateInput) {
    try {
      if (!data.email) {
        throw new BadRequestException('Email is required');
      }

      // Only auto-generate employeeNo for admin roles
      if (
        data.role === 'HR_ADMIN' ||
        data.role === 'KITCHEN_ADMIN'
      ) {
        const lastEmpNo = await this.getLastAdminEmployeeNo(); // e.g., 'A007'

        const lastNumber = parseInt(lastEmpNo.slice(1), 10);
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        data.empNo = `A${nextNumber}`;
      }

      return await this.databaseService.user.create({ data });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this email or employee number already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid organization ID provided');
      }
      throw new BadRequestException('Failed to create user: ' + error.message);
    }
  }

  async getUsers() {
    try {
      return await this.databaseService.user.findMany({
        include: {
          organization: true,
          permissions: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch users: ' + error.message);
    }
  }

  async getUserById(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      const user = await this.databaseService.user.findUnique({
        where: { id },
        include: {
          organization: true,
          permissions: true,
        },
      });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user: ' + error.message);
    }
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      return await this.databaseService.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this email already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid organization ID provided');
      }
      throw new BadRequestException('Failed to update user: ' + error.message);
    }
  }

  async deleteUser(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      return await this.databaseService.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to delete user: ' + error.message);
    }
  }

  async getLastAdminEmployeeNo(): Promise<string> {
    try {
      const admins = await this.databaseService.user.findMany({
        where: {
          role: {
            in: ['HR_ADMIN', 'KITCHEN_ADMIN'],
          },
          empNo: {
            startsWith: 'A',
          },
        },
        orderBy: {
          empNo: 'desc',
        },
        take: 1,
      });

      if (admins.length === 0) {
        return 'A000';
      }

      const lastEmpNo = admins[0].empNo; // e.g., 'A007'
      const lastNumber = parseInt(lastEmpNo.slice(1), 10);
      const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
      return `A${nextNumber}`;
    } catch (error) {
      throw new BadRequestException('Failed to fetch last admin employee number: ' + error.message);
    }
  }

  // Permission CRUD operations
  async createPermission(data: Prisma.PermissionCreateInput) {
    try {
      if (!data.orgId) {
        throw new BadRequestException('Organization ID (orgId) is required');
      }
      if (!data.action) {
        throw new BadRequestException('Action is required');
      }
      if (!data.role) {
        throw new BadRequestException('Role is required');
      }

      return await this.databaseService.permission.create({
        data: {
          orgId: data.orgId,
          action: data.action,
          role: data.role,
          users: data.users || undefined,
        },
        include: {
          users: true,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid organization ID provided');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Permission with these attributes already exists');
      }
      throw new BadRequestException('Failed to create permission: ' + error.message);
    }
  }

  async getPermissions() {
    try {
      return await this.databaseService.permission.findMany({
        include: { users: true },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch permissions: ' + error.message);
    }
  }

  async getPermissionById(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Permission ID is required');
      }
      const permission = await this.databaseService.permission.findUnique({
        where: { id },
        include: { users: true },
      });
      if (!permission) throw new NotFoundException('Permission not found');
      return permission;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch permission: ' + error.message);
    }
  }

  async updatePermission(id: string, data: Prisma.PermissionUpdateInput) {
    try {
      if (!id) {
        throw new BadRequestException('Permission ID is required');
      }
      return await this.databaseService.permission.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Permission not found');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Permission with these attributes already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid organization ID provided');
      }
      throw new BadRequestException('Failed to update permission: ' + error.message);
    }
  }

  async deletePermission(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Permission ID is required');
      }
      return await this.databaseService.permission.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Permission not found');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete permission that is still in use');
      }
      throw new BadRequestException('Failed to delete permission: ' + error.message);
    }
  }

  async getPermissionsByUserId(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user.permissions;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch permissions: ' + error.message);
    }
  }

  async getUserActionsByUserId(userId: string): Promise<string[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const actions = user.permissions.map((permission) => permission.action);

      return actions;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user actions: ' + error.message);
    }
  }
}
