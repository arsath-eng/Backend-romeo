import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevelsService } from './access-levels.service';

describe('AccessLevelsService', () => {
  let service: AccessLevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessLevelsService],
    }).compile();

    service = module.get<AccessLevelsService>(AccessLevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
