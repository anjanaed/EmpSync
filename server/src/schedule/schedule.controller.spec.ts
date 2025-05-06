import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  const mockScheduleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    confirm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a scheduled meal', async () => {
      // Use any type to bypass TypeScript checks in tests
      const createDto: any = {
        date: '2024-01-01',
        breakfast: ['1', '2'],
        lunch: ['3', '4'],
        dinner: ['5', '6']
      };

      const expectedResult = {
        date: new Date('2024-01-01'),
        breakfast: [1, 2],
        lunch: [3, 4],
        dinner: [5, 6],
        confirmed: false
      };

      mockScheduleService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(mockScheduleService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException when creation fails', async () => {
      // Use any type to bypass TypeScript checks in tests
      const createDto: any = {
        date: '2024-01-01'
      };

      const errorMessage = 'Creation failed';
      mockScheduleService.create.mockRejectedValue(new Error(errorMessage));

      await expect(controller.create(createDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createDto)).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: errorMessage
        })
      }));
    });
  });

  describe('findAll', () => {
    it('should return all scheduled meals', async () => {
      const meals = [
        { 
          date: new Date('2024-01-01'), 
          breakfast: [1, 2],
          lunch: [],
          dinner: [3],
          confirmed: false 
        },
        { 
          date: new Date('2024-01-02'), 
          breakfast: [],
          lunch: [4, 5],
          dinner: [6],
          confirmed: true 
        }
      ];

      mockScheduleService.findAll.mockResolvedValue(meals);

      const result = await controller.findAll();
      expect(mockScheduleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(meals);
    });

    it('should throw HttpException when retrieval fails', async () => {
      const errorMessage = 'Retrieval failed';
      mockScheduleService.findAll.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
      await expect(controller.findAll()).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve scheduled meals',
          message: errorMessage
        })
      }));
    });
  });

  describe('findOne', () => {
    it('should find a scheduled meal by date', async () => {
      const date = '2024-01-01';
      const meal = {
        date: new Date(date),
        breakfast: [1, 2],
        lunch: [3],
        dinner: [4, 5],
        confirmed: false
      };

      mockScheduleService.findOne.mockResolvedValue(meal);

      const result = await controller.findOne(date);
      expect(mockScheduleService.findOne).toHaveBeenCalledWith(date);
      expect(result).toEqual(meal);
    });

    it('should throw HttpException when meal not found', async () => {
      const date = '2024-01-01';
      mockScheduleService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(date)).rejects.toThrow(HttpException);
      await expect(controller.findOne(date)).rejects.toThrow('Scheduled meal not found');
    });

    it('should handle service errors correctly', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Service error';
      mockScheduleService.findOne.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findOne(date)).rejects.toThrow(HttpException);
      await expect(controller.findOne(date)).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          error: 'Not Found',
          message: errorMessage
        })
      }));
    });
  });

  describe('update', () => {
    it('should update a scheduled meal', async () => {
      const date = '2024-01-01';
      // Use any type to bypass TypeScript checks in tests
      const updateDto: any = {
        breakfast: ['3', '4'],
        lunch: ['5'],
        dinner: ['6', '7']
      };
      
      const updatedMeal = {
        date: new Date(date),
        breakfast: [3, 4],
        lunch: [5],
        dinner: [6, 7],
        confirmed: false
      };

      mockScheduleService.update.mockResolvedValue(updatedMeal);

      const result = await controller.update(date, updateDto);
      expect(mockScheduleService.update).toHaveBeenCalledWith(date, updateDto);
      expect(result).toEqual(updatedMeal);
    });

    it('should throw HttpException when update fails', async () => {
      const date = '2024-01-01';
      // Use any type to bypass TypeScript checks in tests
      const updateDto: any = {};
      const errorMessage = 'Update failed';
      
      mockScheduleService.update.mockRejectedValue(new Error(errorMessage));

      await expect(controller.update(date, updateDto)).rejects.toThrow(HttpException);
      await expect(controller.update(date, updateDto)).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: errorMessage
        })
      }));
    });
  });

  describe('confirm', () => {
    it('should confirm a scheduled meal', async () => {
      const date = '2024-01-01';
      const confirmedMeal = {
        date: new Date(date),
        breakfast: [1, 2],
        lunch: [3],
        dinner: [4],
        confirmed: true
      };

      mockScheduleService.confirm.mockResolvedValue(confirmedMeal);

      const result = await controller.confirm(date);
      expect(mockScheduleService.confirm).toHaveBeenCalledWith(date);
      expect(result).toEqual(confirmedMeal);
      expect(result.confirmed).toBe(true);
    });

    it('should throw HttpException when confirmation fails', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Confirmation failed';
      
      mockScheduleService.confirm.mockRejectedValue(new Error(errorMessage));

      await expect(controller.confirm(date)).rejects.toThrow(HttpException);
      await expect(controller.confirm(date)).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          error: 'Confirmation failed',
          message: errorMessage
        })
      }));
    });
  });

  describe('remove', () => {
    it('should remove a scheduled meal', async () => {
      const date = '2024-01-01';
      const meal = {
        date: new Date(date),
        breakfast: [1, 2],
        lunch: [3],
        dinner: [4],
        confirmed: false
      };

      mockScheduleService.remove.mockResolvedValue(meal);

      const result = await controller.remove(date);
      expect(mockScheduleService.remove).toHaveBeenCalledWith(date);
      expect(result).toEqual(meal);
    });

    it('should throw HttpException when deletion fails', async () => {
      const date = '2024-01-01';
      const errorMessage = 'Deletion failed';
      
      mockScheduleService.remove.mockRejectedValue(new Error(errorMessage));

      await expect(controller.remove(date)).rejects.toThrow(HttpException);
      await expect(controller.remove(date)).rejects.toThrow(expect.objectContaining({
        response: expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: errorMessage
        })
      }));
    });
  });
});