import { Test, TestingModule } from '@nestjs/testing';
import { OrderTabFingerprintService } from './order-tab-fingerprint.service';

describe('OrderTabFingerprintService', () => {
  let service: OrderTabFingerprintService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderTabFingerprintService],
    }).compile();

    service = module.get<OrderTabFingerprintService>(OrderTabFingerprintService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
