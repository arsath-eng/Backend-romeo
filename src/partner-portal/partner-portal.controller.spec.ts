import { Test, TestingModule } from '@nestjs/testing';
import { PartnerPortalController } from './partner-portal.controller';

describe('PartnerPortalController', () => {
  let controller: PartnerPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerPortalController],
    }).compile();

    controller = module.get<PartnerPortalController>(PartnerPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
