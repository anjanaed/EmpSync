import { Test, TestingModule } from '@nestjs/testing';
import { MealService } from './meal.service';

describe('MealService', () => {
  let service: MealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealService],
    }).compile();

    service = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
