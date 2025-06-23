import { Test, TestingModule } from '@nestjs/testing';
import { onboardingController } from './onboardingTemplate.controller';

describe('ControllerController', () => {
  let controller: onboardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [onboardingController],
    }).compile();

    controller = module.get<onboardingController>(onboardingController);
  });onboardingController

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
