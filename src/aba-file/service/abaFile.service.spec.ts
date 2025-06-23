import { Test, TestingModule } from '@nestjs/testing';
import { abaFileService } from './abaFile.service';

describe('ServiceService', () => {
  let service: abaFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [abaFileService],
    }).compile();

    service = module.get<abaFileService>(abaFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
