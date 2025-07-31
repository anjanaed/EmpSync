import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, HttpException } from '@nestjs/common';

// Mock AuthGuard
class MockAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

// Mock service with all methods
const mockSuperAdminService = {
  createOrganization: jest.fn(),
  getOrganizations: jest.fn(),
  getOrganizationById: jest.fn(),
  getByOrg: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
  getLastOrganizationId: jest.fn(),
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  getPermissionsByUserId: jest.fn(),
  getUserActionsByUserId: jest.fn(),
  getLastAdminEmployeeNo: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getLastEmpIDByOrg: jest.fn(),
  createPermission: jest.fn(),
  getPermissions: jest.fn(),
  getPermissionById: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
  getSystemStatistics: jest.fn(),
};

describe('SuperAdminController', () => {
  let controller: SuperAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        {
          provide: SuperAdminService,
          useValue: mockSuperAdminService,
        },
      ],
    })
      .overrideGuard(AuthGuard('superadmin-jwt'))
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return organizations', async () => {
    const result = [{ id: '1', name: 'Org1' }];
    mockSuperAdminService.getOrganizations.mockResolvedValue(result);
    expect(await controller.getOrganizations()).toBe(result);
  });

  it('should return last organization ID', async () => {
    mockSuperAdminService.getLastOrganizationId.mockResolvedValue('ORG-100');
    const res = await controller.getLastOrganizationId();
    expect(res).toEqual({ id: 'ORG-100' });
  });

  it('should throw error in getLastOrganizationId', async () => {
    mockSuperAdminService.getLastOrganizationId.mockRejectedValue(
      new Error('Failed')
    );
    await expect(controller.getLastOrganizationId()).rejects.toThrowError(
      HttpException
    );
  });

  it('should create user', async () => {
    const dto = { name: 'John', email: 'john@mail.com' } as any;
    const result = { id: 'u1', ...dto };
    mockSuperAdminService.createUser.mockResolvedValue(result);
    expect(await controller.createUser(dto)).toBe(result);
  });

  it('should get user by ID', async () => {
    const user = { id: 'u1', name: 'Test' };
    mockSuperAdminService.getUserById.mockResolvedValue(user);
    expect(await controller.getUserById('u1')).toBe(user);
  });

  it('should delete user', async () => {
    mockSuperAdminService.deleteUser.mockResolvedValue({ success: true });
    expect(await controller.deleteUser('u1')).toEqual({ success: true });
  });

  it('should return system statistics', async () => {
    const stats = { users: 100, organizations: 10 };
    mockSuperAdminService.getSystemStatistics.mockResolvedValue(stats);
    expect(await controller.getSystemStatistics()).toBe(stats);
  });

  it('should get permissions by user id', async () => {
    const perms = [{ id: 'p1', name: 'Read' }];
    mockSuperAdminService.getPermissionsByUserId.mockResolvedValue(perms);
    expect(await controller.getPermissionsByUserId('u1')).toBe(perms);
  });

  it('should create permission', async () => {
    const dto = { name: 'View' } as any;
    const result = { id: 'p1', ...dto };
    mockSuperAdminService.createPermission.mockResolvedValue(result);
    expect(await controller.createPermission(dto)).toBe(result);
  });
});
