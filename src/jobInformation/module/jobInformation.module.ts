import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobInformationController } from '../controller/jobInformation.controller';
import { JobInformationService } from '../service/jobInformation.service';
import { TimezoneModule } from '../../timezone/timezone.module';
import { TimeTrackingModule } from '@flows/time-tracking/time-tracking.module';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    HrmEmployeeDetails,
    HrmConfigs,
    ]), 
  TimeTrackingModule, TimezoneModule],
  controllers: [JobInformationController],
  providers: [JobInformationService],
  exports: [JobInformationService],
})
export class JobInformationModule {}
