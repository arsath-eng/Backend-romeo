import { Test, TestingModule } from '@nestjs/testing';
import { NewPerformanceService } from './new-performance.service';

describe('NewPerformanceService', () => {
  let service: NewPerformanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewPerformanceService],
    }).compile();

    service = module.get<NewPerformanceService>(NewPerformanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
