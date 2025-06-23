import { Test, TestingModule } from '@nestjs/testing';
import { PartnerPortalService } from './partner-portal.service';

describe('PartnerPortalService', () => {
  let service: PartnerPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerPortalService],
    }).compile();

    service = module.get<PartnerPortalService>(PartnerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
