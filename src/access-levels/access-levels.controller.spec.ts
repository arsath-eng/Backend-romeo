import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevelsController } from './access-levels.controller';

describe('AccessLevelsController', () => {
  let controller: AccessLevelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessLevelsController],
    }).compile();

    controller = module.get<AccessLevelsController>(AccessLevelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
