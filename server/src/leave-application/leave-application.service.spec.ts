import { Test, TestingModule } from '@nestjs/testing';
import { LeaveApplicationService } from './leave-application.service';

describe('LeaveApplicationService', () => {
  let service: LeaveApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaveApplicationService],
    }).compile();

    service = module.get<LeaveApplicationService>(LeaveApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
