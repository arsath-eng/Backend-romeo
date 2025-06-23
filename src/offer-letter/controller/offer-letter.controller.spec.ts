import { Test, TestingModule } from '@nestjs/testing';
import { OfferLetterController } from './offer-letter.controller';

describe('OfferLetterController', () => {
  let controller: OfferLetterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferLetterController],
    }).compile();

    controller = module.get<OfferLetterController>(OfferLetterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
