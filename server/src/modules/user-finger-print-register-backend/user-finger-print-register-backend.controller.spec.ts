import { Test, TestingModule } from '@nestjs/testing';
import { UserFingerPrintRegisterBackendController } from './user-finger-print-register-backend.controller';

describe('UserFingerPrintRegisterBackendController', () => {
  let controller: UserFingerPrintRegisterBackendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFingerPrintRegisterBackendController],
    }).compile();

    controller = module.get<UserFingerPrintRegisterBackendController>(UserFingerPrintRegisterBackendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
