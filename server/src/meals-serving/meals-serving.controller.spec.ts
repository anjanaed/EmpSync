import { Test, TestingModule } from '@nestjs/testing';
import { MealsServingController } from './meals-serving.controller';

describe('MealsServingController', () => {
  let controller: MealsServingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsServingController],
    }).compile();

    controller = module.get<MealsServingController>(MealsServingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
