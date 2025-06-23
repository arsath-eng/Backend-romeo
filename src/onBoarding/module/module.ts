import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnboardingTaskEmployeesController } from '../controller/controller';
import { OnboardingTaskEmployeesService } from '../service/service';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { TimezoneModule } from '@flows/timezone/timezone.module';
import { onBoardingTasksService } from '../service/onBoarding.task.services';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmBoardingTaskEmployees,
    HrmEmployeeDetails,
    HrmNotifications,
    HrmConfigs
  ])
  ,  TimezoneModule, NotificationsModule],
  controllers: [OnboardingTaskEmployeesController],
  providers: [OnboardingTaskEmployeesService,onBoardingTasksService],
  exports: [OnboardingTaskEmployeesService,onBoardingTasksService],
})
export class OnboardingTaskEmployeesModule {}
