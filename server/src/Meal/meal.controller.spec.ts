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
    id: '1',
    nameEnglish: 'Test Meal',
    nameSinhala: 'පරික්ෂණ කෑම',
    nameTamil: 'சோதனை உணவு',
    description: 'Test Description',
    price: 9.99,
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
  });

  describe('findOne', () => {
    it('should return a single meal', async () => {
      mockMealService.findOne.mockResolvedValue(mockMeal);
      expect(await controller.findOne('1')).toEqual(mockMeal);
    });
  });

  describe('update', () => {
    it('should update a meal', async () => {
      mockMealService.update.mockResolvedValue(mockMeal);
      expect(await controller.update('1', mockMeal)).toEqual(mockMeal);
    });
  });

  describe('remove', () => {
    it('should remove a meal', async () => {
      mockMealService.remove.mockResolvedValue(mockMeal);
      expect(await controller.remove('1')).toEqual(mockMeal);
    });
  });
});
