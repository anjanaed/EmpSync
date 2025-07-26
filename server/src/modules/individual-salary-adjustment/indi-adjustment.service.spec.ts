import { Test, TestingModule } from '@nestjs/testing';
import { IndiAdjustmentService } from './in-adjustment.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException } from '@nestjs/common';

describe('IndiAdjustmentService', () => {
  let service: IndiAdjustmentService;
  let db: { user: any; individualSalaryAdjustments: any };

  beforeEach(async () => {
    // Mock structure of databaseService with the needed nested Prisma methods
    db = {
      user: {
        findFirst: jest.fn(),
      },
      individualSalaryAdjustments: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndiAdjustmentService,
        {
          provide: DatabaseService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<IndiAdjustmentService>(IndiAdjustmentService);
  });

  describe('create', () => {
    it('should create an adjustment when empNo is provided and employee exists', async () => {
      const dto = {
        empNo: 'E001',
        orgId: 'ORG123',
        label: 'Bonus',
        value: 1000,
      };

      db.user.findFirst.mockResolvedValue({ id: 'user123' });
      db.individualSalaryAdjustments.create.mockResolvedValue({
        id: 1,
        empId: 'user123',
        label: 'Bonus',
        value: 1000,
      });

      const result = await service.create(dto as any);
      expect(result).toEqual({
        id: 1,
        empId: 'user123',
        label: 'Bonus',
        value: 1000,
      });
    });

    it('should throw BadRequestException if employee is not found', async () => {
      db.user.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          empNo: 'INVALID',
          orgId: 'ORG123',
          label: 'Bonus',
          value: 1000,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a list of adjustments', async () => {
      db.individualSalaryAdjustments.findMany.mockResolvedValue([
        { id: 1, label: 'Bonus' },
        { id: 2, label: 'Allowance' },
      ]);

      const result = await service.findAll('Bonus', 'ORG123');
      expect(result.length).toBe(2);
    });
  });

  // Add similar tests for findOne, update, remove...

});
