import { Test, TestingModule } from '@nestjs/testing';
import { MealsServingService } from './meals-serving.service';

describe('MealsServingService', () => {
  let service: MealsServingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealsServingService],
    }).compile();

    service = module.get<MealsServingService>(MealsServingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
