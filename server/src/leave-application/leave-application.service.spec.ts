import { Test, TestingModule } from '@nestjs/testing';
import { LeaveApplicationService } from './leave-application.service';
import { DatabaseService } from '../database/database.service';
import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('LeaveApplicationService', () => {
  let leaveApplicationService: LeaveApplicationService;
  let databaseService: DatabaseService;
  const mockDatabaseService = {
    leaveApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveApplicationService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    leaveApplicationService = module.get<LeaveApplicationService>(LeaveApplicationService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(leaveApplicationService).toBeDefined();
  });

  describe('create', () => {
    it('should create a leave application successfully', async () => {
      const dto: Prisma.LeaveApplicationCreateInput = {
        appliedDate: new Date(),
        duration: 5.0,
        empId: '1',
        reason: 'Medical leave',
        status: false,
        reviewedBy: 'Manager',
      };
      mockDatabaseService.leaveApplication.create.mockResolvedValue(dto);

      await expect(leaveApplicationService.create(dto)).resolves.not.toThrow();
      expect(mockDatabaseService.leaveApplication.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw conflict error if leave application ID is not unique', async () => {
      mockDatabaseService.leaveApplication.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        leaveApplicationService.create({
          appliedDate: new Date(),
          duration: 5.0,
          empId: '1',
          reason: 'Medical leave',
          status: false,
          reviewedBy: 'Manager',
        }),
      ).rejects.toThrow(HttpException);
      expect(mockDatabaseService.leaveApplication.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of leave applications', async () => {
      const mockLeaveApplications = [
        {
          id: 1,
          appliedDate: new Date(),
          duration: 5.0,
          empId: '1',
          reason: 'Medical leave',
          status: false,
          reviewedBy: 'Manager',
        },
      ];
      mockDatabaseService.leaveApplication.findMany.mockResolvedValue(mockLeaveApplications);

      await expect(leaveApplicationService.findAll()).resolves.toEqual(mockLeaveApplications);
      expect(mockDatabaseService.leaveApplication.findMany).toHaveBeenCalled();
    });

    it('should throw an error if no leave applications are found', async () => {
      mockDatabaseService.leaveApplication.findMany.mockResolvedValue(null);

      await expect(leaveApplicationService.findAll()).rejects.toThrow('No Leave Applications');
    });
  });

  describe('findOne', () => {
    it('should return a leave application by ID', async () => {
      const mockLeaveApplication = {
        id: 1,
        appliedDate: new Date(),
        duration: 5.0,
        empId: '1',
        reason: 'Medical leave',
        status: false,
        reviewedBy: 'Manager',
      };
      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(mockLeaveApplication);

      await expect(leaveApplicationService.findOne(1)).resolves.toEqual(mockLeaveApplication);
    });

    it('should throw an error if leave application is not found', async () => {
      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(null);

      await expect(leaveApplicationService.findOne(2)).rejects.toThrow('Leave Application Not Found');
    });
  });

  describe('update', () => {
    it('should update a leave application if found', async () => {
      const mockLeaveApplication = {
        id: 1,
        appliedDate: new Date(),
        duration: 5.0,
        empId: '1',
        reason: 'Medical leave',
        status: false,
        reviewedBy: 'Manager',
      };
      const updateData: Prisma.LeaveApplicationUpdateInput = { status: true };

      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(mockLeaveApplication);
      mockDatabaseService.leaveApplication.update.mockResolvedValue({ ...mockLeaveApplication, ...updateData });

      await expect(leaveApplicationService.update(1, updateData)).resolves.not.toThrow();
      expect(mockDatabaseService.leaveApplication.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw an error if leave application is not found', async () => {
      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(null);

      await expect(leaveApplicationService.update(2, { status: true })).rejects.toThrow('Leave Application Not Found');
    });
  });

  describe('delete', () => {
    it('should delete a leave application if found', async () => {
      const mockLeaveApplication = {
        id: 1,
        appliedDate: new Date(),
        duration: 5.0,
        empId: '1',
        reason: 'Medical leave',
        status: false,
        reviewedBy: 'Manager',
      };
      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(mockLeaveApplication);
      mockDatabaseService.leaveApplication.delete.mockResolvedValue(mockLeaveApplication);

      await expect(leaveApplicationService.remove(1)).resolves.not.toThrow();
      expect(mockDatabaseService.leaveApplication.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if leave application is not found', async () => {
      mockDatabaseService.leaveApplication.findUnique.mockResolvedValue(null);

      await expect(leaveApplicationService.remove(2)).rejects.toThrow('Leave Application Not Found');
    });
  });
});
