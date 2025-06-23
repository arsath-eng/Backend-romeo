import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingTaskController } from './onboardingTask.controller';

describe('onboardingTaskController', () => {
  let controller: OnboardingTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingTaskController],
    }).compile();

    controller = module.get<OnboardingTaskController>(OnboardingTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
