import { Test, TestingModule } from '@nestjs/testing';
import { HrFingerprintsService } from './hr-fingerprints.service';

describe('HrFingerprintsService', () => {
  let service: HrFingerprintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrFingerprintsService],
    }).compile();

    service = module.get<HrFingerprintsService>(HrFingerprintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
