import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const mockIngredient = {
    id: 1,
    name: 'Test Ingredient',
    quantity: 100,
    unit: 'kg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockIngredientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockIngredientsService,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ingredient', async () => {
      mockIngredientsService.create.mockResolvedValue(mockIngredient);

      const result = await controller.create({
        id: '123135',
        name: 'Test Ingredient',
        quantity: 100,
        price_per_unit:50.10,
        priority: 1,
      });

      expect(result).toEqual(mockIngredient);
      expect(mockIngredientsService.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of ingredients', async () => {
      mockIngredientsService.findAll.mockResolvedValue([mockIngredient]);

      const result = await controller.findAll();

      expect(result).toEqual([mockIngredient]);
      expect(mockIngredientsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ingredient', async () => {
      mockIngredientsService.findOne.mockResolvedValue(mockIngredient);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockIngredient);
      expect(mockIngredientsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updatedIngredient = { ...mockIngredient, quantity: 200 };
      mockIngredientsService.update.mockResolvedValue(updatedIngredient);

      const result = await controller.update('1', { quantity: 200 });

      expect(result).toEqual(updatedIngredient);
      expect(mockIngredientsService.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an ingredient', async () => {
      mockIngredientsService.remove.mockResolvedValue(mockIngredient);

      const result = await controller.remove('1');

      expect(result).toEqual(mockIngredient);
      expect(mockIngredientsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
