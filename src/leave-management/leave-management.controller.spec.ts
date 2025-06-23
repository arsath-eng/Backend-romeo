import { Test, TestingModule } from '@nestjs/testing';
import { LeaveManagementController } from './leave-management.controller';

describe('LeaveManagementController', () => {
  let controller: LeaveManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveManagementController],
    }).compile();

    controller = module.get<LeaveManagementController>(LeaveManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
