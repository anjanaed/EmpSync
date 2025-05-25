import { Test, TestingModule } from '@nestjs/testing';
import { OrderTabFingerprintController } from './order-tab-fingerprint.controller';

describe('OrderTabFingerprintController', () => {
  let controller: OrderTabFingerprintController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderTabFingerprintController],
    }).compile();

    controller = module.get<OrderTabFingerprintController>(OrderTabFingerprintController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
