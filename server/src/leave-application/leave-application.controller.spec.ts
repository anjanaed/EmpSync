import { Test, TestingModule } from '@nestjs/testing';
import { LeaveApplicationController } from './leave-application.controller';
import { LeaveApplicationService } from './leave-application.service';

describe('LeaveApplicationController', () => {
  let controller: LeaveApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveApplicationController],
      providers: [LeaveApplicationService],
    }).compile();

    controller = module.get<LeaveApplicationController>(LeaveApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
