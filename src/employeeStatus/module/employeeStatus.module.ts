import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeStatusController } from '../controller/employeeStatus.controller';
import { EmployeeStatusService } from '../service/employeeStatus.service';
import { TimezoneModule } from '../../timezone/timezone.module';
import { TimeTrackingModule } from '@flows/time-tracking/time-tracking.module';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { TimeTrackingService } from '@flows/time-tracking/time-tracking.service';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmConfigs,
      HrmActivityTracking,
      // HrmProjectsTime,
      // HrmProjectsTimeEntries
    ]),
    TimeTrackingModule,TimezoneModule
  ],
  controllers: [EmployeeStatusController],
  providers: [EmployeeStatusService],
  exports: [],
})
export class EmployeeStatusModule {}
