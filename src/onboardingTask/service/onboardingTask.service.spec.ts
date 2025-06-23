import { Test, TestingModule } from '@nestjs/testing';
import { onboardingTaskService } from './onboardingTask.service';

describe('onboardingTaskService', () => {
  let service: onboardingTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [onboardingTaskService],
    }).compile();

    service = module.get<onboardingTaskService>(onboardingTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
