import { Test, TestingModule } from '@nestjs/testing';
import { UserFingerPrintRegisterBackendService } from './user-finger-print-register-backend.service';

describe('UserFingerPrintRegisterBackendService', () => {
  let service: UserFingerPrintRegisterBackendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFingerPrintRegisterBackendService],
    }).compile();

    service = module.get<UserFingerPrintRegisterBackendService>(UserFingerPrintRegisterBackendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
