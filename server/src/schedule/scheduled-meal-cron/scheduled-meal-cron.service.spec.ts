import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMealCronService } from './scheduled-meal-cron.service';

describe('ScheduledMealCronService', () => {
  let service: ScheduledMealCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledMealCronService],
    }).compile();

    service = module.get<ScheduledMealCronService>(ScheduledMealCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
