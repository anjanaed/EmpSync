import { Test, TestingModule } from '@nestjs/testing';
import { PersonalizedMealSuggestionsController } from './personalized-meal-suggestions.controller';
import { PersonalizedMealSuggestionsService } from './personalized-meal-suggestions.service';

describe('PersonalizedMealSuggestionsController', () => {
  let controller: PersonalizedMealSuggestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalizedMealSuggestionsController],
      providers: [PersonalizedMealSuggestionsService],
    }).compile();

    controller = module.get<PersonalizedMealSuggestionsController>(PersonalizedMealSuggestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
