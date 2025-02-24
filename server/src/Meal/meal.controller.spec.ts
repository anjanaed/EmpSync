import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MealController', () => {
  let controller: MealController;
  let service: MealService;

  const mockMealService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockMeal = {
    id: 1,
    name: 'Test Meal',
    description: 'Test Description',
    price: 9.99,
    category: 'Test Category',
    imageUrl: 'test.jpg',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealController],
      providers: [
        {
          provide: MealService,
          useValue: mockMealService,
        },
      ],
    }).compile();

    controller = module.get<MealController>(MealController);
    service = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal', async () => {
      mockMealService.create.mockResolvedValue(mockMeal);
      expect(await controller.create(mockMeal)).toEqual(mockMeal);
    });

    it('should throw BadRequestException on error', async () => {
      mockMealService.create.mockRejectedValue(new Error('Error creating meal'));
      await expect(controller.create(mockMeal)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return array of meals', async () => {
      mockMealService.findAll.mockResolvedValue([mockMeal]);
      expect(await controller.findAll()).toEqual([mockMeal]);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockMealService.findAll.mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single meal', async () => {
      mockMealService.findOne.mockResolvedValue(mockMeal);
      expect(await controller.findOne(1)).toEqual(mockMeal);
    });

    it('should throw NotFoundException when meal not found', async () => {
      mockMealService.findOne.mockResolvedValue(null);
      await expect(controller.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a meal', async () => {
      mockMealService.update.mockResolvedValue(mockMeal);
      expect(await controller.update(1, mockMeal)).toEqual(mockMeal);
    });

    it('should throw BadRequestException on error', async () => {
      mockMealService.update.mockRejectedValue(new Error('Error updating meal'));
      await expect(controller.update(1, mockMeal)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      mockMealService.remove.mockResolvedValue(mockMeal);
      expect(await controller.remove(1)).toEqual(mockMeal);
    });

    it('should throw NotFoundException on error', async () => {
      mockMealService.remove.mockRejectedValue(new Error('Meal not found'));
      await expect(controller.remove(999)).rejects.toThrow(HttpException);
    });
  });
});