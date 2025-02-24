import { Test, TestingModule } from '@nestjs/testing';
import { LeaveApplicationController } from './leave-application.controller';
import { LeaveApplicationService } from './leave-application.service';
import { Prisma } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('LeaveApplicationController', () => {
  let controller: LeaveApplicationController;
  let service: LeaveApplicationService;

  const mockLeaveApplicationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveApplicationController],
      providers: [
        {
          provide: LeaveApplicationService,
          useValue: mockLeaveApplicationService,
        },
      ],
    }).compile();

    controller = module.get<LeaveApplicationController>(LeaveApplicationController);
    service = module.get<LeaveApplicationService>(LeaveApplicationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      mockLeaveApplicationService.create.mockResolvedValue(dto);

      await expect(controller.create(dto)).resolves.toEqual(dto);
      expect(mockLeaveApplicationService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw conflict error if leave application ID is not unique', async () => {
      mockLeaveApplicationService.create.mockRejectedValue(new HttpException('Conflict', 409));

      await expect(
        controller.create({
          appliedDate: new Date(),
          duration: 5.0,
          empId: '1',
          reason: 'Medical leave',
          status: false,
          reviewedBy: 'Manager',
        }),
      ).rejects.toThrow(HttpException);
      expect(mockLeaveApplicationService.create).toHaveBeenCalled();
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
      mockLeaveApplicationService.findAll.mockResolvedValue(mockLeaveApplications);

      await expect(controller.findAll()).resolves.toEqual(mockLeaveApplications);
      expect(mockLeaveApplicationService.findAll).toHaveBeenCalled();
    });

    it('should throw an error if no leave applications are found', async () => {
      mockLeaveApplicationService.findAll.mockRejectedValue(new Error('No Leave Applications'));

      await expect(controller.findAll()).rejects.toThrow('No Leave Applications');
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
      mockLeaveApplicationService.findOne.mockResolvedValue(mockLeaveApplication);

      await expect(controller.findOne('1')).resolves.toEqual(mockLeaveApplication); // Changed ID to string
    });

    it('should throw an error if leave application is not found', async () => {
      mockLeaveApplicationService.findOne.mockRejectedValue(new Error('Leave Application Not Found'));

      await expect(controller.findOne('2')).rejects.toThrow('Leave Application Not Found'); // Changed ID to string
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

      mockLeaveApplicationService.findOne.mockResolvedValue(mockLeaveApplication);
      mockLeaveApplicationService.update.mockResolvedValue({ ...mockLeaveApplication, ...updateData });

      await expect(controller.update('1', updateData)).resolves.toEqual(`Leave Application 1 Updated Successfully`);
      expect(mockLeaveApplicationService.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw an error if leave application is not found', async () => {
      mockLeaveApplicationService.findOne.mockResolvedValue(null);
      mockLeaveApplicationService.update.mockRejectedValue(new Error('Leave Application Not Found'));

      await expect(controller.update('5', { status: true })).rejects.toThrow('Leave Application Not Found');
    });
  });

  describe('remove', () => {
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
      mockLeaveApplicationService.findOne.mockResolvedValue(mockLeaveApplication);
      mockLeaveApplicationService.remove.mockResolvedValue(mockLeaveApplication);

      await expect(controller.remove('1')).resolves.toEqual(mockLeaveApplication); // Changed ID to string
      expect(mockLeaveApplicationService.remove).toHaveBeenCalledWith(1); // Changed ID to number
    });

    it('should throw an error if leave application is not found', async () => {
      mockLeaveApplicationService.findOne.mockResolvedValue(null);
      mockLeaveApplicationService.remove.mockRejectedValue(new Error('Leave Application Not Found'));

      await expect(controller.remove('2')).rejects.toThrow('Leave Application Not Found'); // Changed ID to string
    });
  });
});
