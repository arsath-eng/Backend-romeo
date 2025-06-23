import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from '../controller/controller';
import { ReportsService } from '../service/service';
import { access } from 'fs';
import { AccessLevelsEmployeesModule } from '../../settingsAccessLevelsEmployees/module/module';
import { JobInformationModule } from '@flows/jobInformation/module/jobInformation.module';
import { EmployeeModule } from '../../employee/module/employee.module';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { CompanyModule } from '@flows/company/module/company.module';
import { TimeTrackingModule } from '@flows/time-tracking/time-tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmConfigs,
      HrmReports,
      HrmFolders,
      HrmNotes,
    ]),
    TimeTrackingModule, CompanyModule,AccessLevelsEmployeesModule,EmployeeModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
