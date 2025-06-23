import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffboardingTaskController } from '../controller/controller';
import { OffboardingTaskService } from '../service/service';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmBoardingTaskEmployees,
    HrmConfigs
  ]), ],
  controllers: [OffboardingTaskController],
  providers: [OffboardingTaskService],
  exports: [],
})
export class OffboardingTaskModule {}
