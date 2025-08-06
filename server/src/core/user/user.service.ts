import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  async regeneratePasskey(id: string, adminId?: string) {
    try {
      // Generate a unique 6-digit passkey
      let unique = false;
      let passkey: number;
      while (!unique) {
        passkey = Math.floor(100000 + Math.random() * 900000); // 6-digit
        const existing = await this.databaseService.user.findFirst({
          where: { passkey },
        });
        if (!existing) unique = true;
      }
      // Update user with new passkey
      const user = await this.databaseService.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }

      // Get admin name if adminId is provided
      let adminName = null;
      if (adminId) {
        const admin = await this.databaseService.user.findUnique({
          where: { id: adminId },
          select: { name: true },
        });
        adminName = admin?.name || 'Unknown Admin';
      }

      await this.databaseService.user.update({
        where: { id },
        data: {
          passkey,
          passkeyRegeneratedBy: adminName,
          passkeyRegeneratedAt: new Date(),
        },
      });
      return passkey;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: Prisma.UserCreateInput) {
    try {
      if (dto.id == null || dto.name == null || dto.email == null) {
        throw new HttpException(
          'Id, Name, Email must be filled',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate a unique 6-digit passkey
      let unique = false;
      let passkey: number;
      while (!unique) {
        passkey = Math.floor(100000 + Math.random() * 900000); // 6-digit
        const existing = await this.databaseService.user.findFirst({
          where: { passkey },
        });
        if (!existing) unique = true;
      }
      dto.passkey = passkey;

      await this.databaseService.user.create({ data: dto });
      return passkey;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException(
          `Employee Number or Email Already Registered`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(search?: string, role?: string, orgId?: string) {
    try {
      const where: any = {
        role: role || undefined,
        organizationId: orgId || undefined,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { empNo: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await this.databaseService.user.findMany({
        where,
      });
      if (users) {
        return users;
      } else {
        throw new HttpException('No Users', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (user) {
        return user;
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fetchRole(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
      return user.role;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, dto: Prisma.UserUpdateInput) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        await this.databaseService.user.update({
          where: {
            id,
          },
          data: dto,
        });
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException(
          `Employee Number Already Exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        await this.databaseService.user.delete({
          where: { id },
        });
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getLastEmpNoByOrg(organizationId: string) {
    const lastUser = await this.databaseService.user.findFirst({
      where: { organizationId },
      orderBy: { id: 'desc' },
    });
    return lastUser?.id || null;
  }

  async findNameByIdAndOrg(id: string, orgId: string) {
    return await this.databaseService.user.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      select: {
        name: true,
      },
    });
  }

  async findEmpNoByIdAndOrg(id: string, orgId: string) {
    try {
      const user = await this.databaseService.user.findFirst({
        where: {
          id,
          organizationId: orgId,
        },
        select: {
          empNo: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findIdByEmpNoAndOrg(empNo: string, orgId: string) {
    try {
      const user = await this.databaseService.user.findFirst({
        where: {
          empNo,
          organizationId: orgId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByPasskey(passkey: number) {
    try {
      const user = await this.databaseService.user.findFirst({
        where: {
          passkey,
        },
        select: {
          id: true,
          name: true,
          gender: true,
          organizationId: true,
        },
      });
      if (user) {
        return user;
      } else {
        throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
