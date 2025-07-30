import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredient.controller';
import { IngredientsService } from './ingredient.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByOrgId: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should create an ingredient', async () => {
    const dto: Prisma.IngredientCreateInput = { name: 'Salt',  orgId: 'org1'};
    const result = { id: 1, ...dto };
    mockService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual({
      message: 'Ingredient created successfully',
      data: result,
    });
  });

  it('should handle error on create', async () => {
    mockService.create.mockRejectedValue(new Error('Create failed'));
    const dto: Prisma.IngredientCreateInput = { name: 'Salt', orgId:  'org1'  };

    await expect(controller.create(dto)).rejects.toThrow(HttpException);
  });

  it('should return all ingredients', () => {
    mockService.findAll.mockReturnValue(['one', 'two']);
    expect(controller.findAll()).toEqual(['one', 'two']);
  });

  it('should return one ingredient', () => {
    mockService.findOne.mockReturnValue({ id: 1, name: 'Salt' });
    expect(controller.findOne(1)).toEqual({ id: 1, name: 'Salt' });
  });

  it('should update an ingredient', () => {
    const updateDto = { name: 'Sugar' };
    mockService.update.mockReturnValue({ id: 1, ...updateDto });
    expect(controller.update(1, updateDto)).toEqual({ id: 1, name: 'Sugar' });
  });

  it('should get ingredients by org ID', async () => {
    mockService.findByOrgId.mockResolvedValue([{ id: 1, name: 'Salt' }]);
    expect(await controller.getIngredientsByOrgId('org1')).toEqual([{ id: 1, name: 'Salt' }]);
  });

  it('should delete an ingredient', () => {
    mockService.remove.mockReturnValue({ message: 'Deleted' });
    expect(controller.remove(1)).toEqual({ message: 'Deleted' });
  });
});
