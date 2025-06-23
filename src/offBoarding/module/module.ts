import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffboardingTaskEmployeesController } from '../controller/controller';
import { OffboardingTaskEmployeesService } from '../service/service';
import { OffboardingTasksService } from '../service/offBoarding.task.services';
import { TimezoneModule } from '../../timezone/timezone.module';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { NotificationsModule } from '@flows/notifications/module/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmBoardingTaskEmployees,
    HrmEmployeeDetails,
    HrmNotifications,
    HrmConfigs
  ]),  TimezoneModule, NotificationsModule],
  controllers: [OffboardingTaskEmployeesController],
  providers: [OffboardingTaskEmployeesService,OffboardingTasksService],
  exports: [OffboardingTaskEmployeesService,OffboardingTasksService],
})
export class OffboardingTaskEmployeesModule {}
