import { Test, TestingModule } from '@nestjs/testing';
import { HrFingerprintsController } from './hr-fingerprints.controller';

describe('HrFingerprintsController', () => {
  let controller: HrFingerprintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrFingerprintsController],
    }).compile();

    controller = module.get<HrFingerprintsController>(HrFingerprintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
