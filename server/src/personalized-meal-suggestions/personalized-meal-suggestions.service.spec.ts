import { Test, TestingModule } from '@nestjs/testing';
import { PersonalizedMealSuggestionsService } from './personalized-meal-suggestions.service';

describe('PersonalizedMealSuggestionsService', () => {
  let service: PersonalizedMealSuggestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalizedMealSuggestionsService],
    }).compile();

    service = module.get<PersonalizedMealSuggestionsService>(PersonalizedMealSuggestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
