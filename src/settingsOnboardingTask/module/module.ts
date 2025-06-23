import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnboardingTaskController } from '../controller/controller';
import { OnboardingTaskService } from '../service/service';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmConfigs,
    HrmEmployeeDetails,
    HrmBoardingTaskEmployees,
  ]), ],
  controllers: [OnboardingTaskController],
  providers: [OnboardingTaskService],
  exports: [],
})
export class OnboardingTaskModule {}
