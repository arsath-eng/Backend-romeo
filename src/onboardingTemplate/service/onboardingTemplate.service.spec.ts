import { Test, TestingModule } from '@nestjs/testing';
import { onboardingTemplateService } from './onboardingTemplate.service';

describe('ServiceService', () => {
  let service: onboardingTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [onboardingTemplateService],
    }).compile();

    service = module.get<onboardingTemplateService>(onboardingTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
