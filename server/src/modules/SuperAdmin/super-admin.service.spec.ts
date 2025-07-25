import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminService } from './super-admin.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockDb = {
  organization: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  permission: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SuperAdminService', () => {
  let service: SuperAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<SuperAdminService>(SuperAdminService);
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('should create an organization with ID starting from O001', async () => {
      mockDb.organization.findFirst.mockResolvedValue(null);
      mockDb.organization.create.mockResolvedValue({ id: 'O001', name: 'Org1' });

      const result = await service.createOrganization({ name: 'Org1' } as any);

      expect(result).toEqual({ id: 'O001', name: 'Org1' });
      expect(mockDb.organization.create).toHaveBeenCalledWith({ data: { id: 'O001', name: 'Org1' } });
    });

    it('should increment ID from last organization', async () => {
      mockDb.organization.findFirst.mockResolvedValue({ id: 'O007' });
      mockDb.organization.create.mockResolvedValue({ id: 'O008', name: 'Org2' });

      const result = await service.createOrganization({ name: 'Org2' } as any);

      expect(result.id).toBe('O008');
    });

    it('should throw if name is missing', async () => {
      await expect(service.createOrganization({} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrganizationById', () => {
    it('should return organization if found', async () => {
      mockDb.organization.findUnique.mockResolvedValue({ id: 'O001', name: 'Org1', users: [] });

      const result = await service.getOrganizationById('O001');
      expect(result.name).toBe('Org1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockDb.organization.findUnique.mockResolvedValue(null);

      await expect(service.getOrganizationById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      mockDb.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      const result = await service.getUsers();
      expect(result.length).toBe(2);
    });
  });

  describe('getPermissions', () => {
    it('should return a list of permissions', async () => {
      mockDb.permission.findMany.mockResolvedValue([{ id: 'p1' }]);
      const result = await service.getPermissions();
      expect(result).toEqual([{ id: 'p1' }]);
    });
  });

  describe('getSystemStatistics', () => {
    it('should compute organization and user stats correctly', async () => {
      mockDb.organization.findMany.mockResolvedValue([
        {
          id: 'O001',
          name: 'Org1',
          users: [
            { role: 'HR_ADMIN' },
            { role: 'KITCHEN_ADMIN' },
            { role: 'EMPLOYEE' },
          ],
        },
        {
          id: 'O002',
          name: 'Org2',
          users: [{ role: 'EMPLOYEE' }],
        },
      ]);

      const result = await service.getSystemStatistics();

      expect(result.totalOrganizations).toBe(2);
      expect(result.totalHRAdmins).toBe(1);
      expect(result.totalKitchenAdmins).toBe(1);
      expect(result.totalOtherUsers).toBe(2);
      expect(result.totalUsers).toBe(4);
    });
  });
});
