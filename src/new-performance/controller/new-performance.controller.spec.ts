import { Test, TestingModule } from '@nestjs/testing';
import { NewPerformanceController } from './new-performance.controller';

describe('NewPerformanceController', () => {
  let controller: NewPerformanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewPerformanceController],
    }).compile();

    controller = module.get<NewPerformanceController>(NewPerformanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
