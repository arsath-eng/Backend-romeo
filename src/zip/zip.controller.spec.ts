import { Test, TestingModule } from '@nestjs/testing';
import { ZipController } from './zip.controller';

describe('ZipController', () => {
  let controller: ZipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipController],
    }).compile();

    controller = module.get<ZipController>(ZipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
