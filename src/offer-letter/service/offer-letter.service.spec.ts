import { Test, TestingModule } from '@nestjs/testing';
import { OfferLetterService } from './offer-letter.service';

describe('OfferLetterService', () => {
  let service: OfferLetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfferLetterService],
    }).compile();

    service = module.get<OfferLetterService>(OfferLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
