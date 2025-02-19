import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { Repository } from 'typeorm';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let repository: Repository<Ingredient>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockIngredient = {
    id: '1',
    name: 'Test Ingredient',
    price_per_unit: 10.50,
    quantity: 100.00,
    priority: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: getRepositoryToken(Ingredient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
    repository = module.get<Repository<Ingredient>>(getRepositoryToken(Ingredient));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ingredient', async () => {
      mockRepository.create.mockReturnValue(mockIngredient);
      mockRepository.save.mockResolvedValue(mockIngredient);

      const result = await service.create({
        id: '1',
        name: 'Test Ingredient',
        price_per_unit: 10.50,
        quantity: 100.00,
        priority: 1,
      });

      expect(result).toEqual(mockIngredient);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of ingredients', async () => {
      mockRepository.find.mockResolvedValue([mockIngredient]);

      const result = await service.findAll();

      expect(result).toEqual([mockIngredient]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ingredient', async () => {
      mockRepository.findOne.mockResolvedValue(mockIngredient);

      const result = await service.findOne('1');

      expect(result).toEqual(mockIngredient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updatedIngredient = {
        ...mockIngredient,
        price_per_unit: 12.50,
        quantity: 200.00,
      };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedIngredient);

      const result = await service.update('1', {
        price_per_unit: 12.50,
        quantity: 200.00,
      });

      expect(result.price_per_unit).toBe(12.50);
      expect(result.quantity).toBe(200.00);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an ingredient', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockIngredient);

      const result = await service.remove('1');

      expect(result).toEqual(mockIngredient);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
