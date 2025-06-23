import { Test, TestingModule } from '@nestjs/testing';
import { abaFileController } from './abaFile.controller';

describe('ControllerController', () => {
  let controller: abaFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [abaFileController],
    }).compile();

    controller = module.get<abaFileController>(abaFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
