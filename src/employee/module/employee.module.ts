import { HrmActivityTracking } from "@flows/allEntities/activityTracking.entity";
import { HrmAnnouncements } from "@flows/allEntities/announcements.entity";
import { HrmAttendance } from "@flows/allEntities/attendance.entity";
import { HrmBoardingTaskEmployees } from "@flows/allEntities/boardingTaskEmployees.entity";
import { HrmConfigs } from "@flows/allEntities/configs.entity";
import { HrmCustomerSupport } from "@flows/allEntities/customerSupport.entity";
import { HrmEmployeeDetails } from "@flows/allEntities/employeeDetails.entity";
import { HrmFiles } from "@flows/allEntities/hrmFiles.entity";
import { HrmFolders } from "@flows/allEntities/hrmFolders.entity";
import { HrmNotes } from "@flows/allEntities/notes.entity";
import { HrmNotifications } from "@flows/allEntities/notifications.entity";
import { HrmOfferLetter } from "@flows/allEntities/offerLetter.entity";
import { HrmPerformanceTask } from "@flows/allEntities/performanceTask.entity";
import { HrmReports } from "@flows/allEntities/reports.entity";
import { HrmTalentPools } from "@flows/allEntities/talentPools.entity";
import { HrmTrainingComplete } from "@flows/allEntities/trainingComplete.entity";
import { HrmVerification } from "@flows/allEntities/verification.entity";

import { ImageCompressorModule } from "@flows/image-compressor/image-compressor.module";
import { S3Module } from "@flows/s3/module/module";
import { EmailsNewModule } from "@flows/ses/module/emails.module";
import { APIModule } from "@flows/superAdminPortalAPI/APIservice.module";
import { TimeTrackingModule } from "@flows/time-tracking/time-tracking.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "../controller/employee.controller";
import { EmployeeService } from "../service/employee.service";
import { hrmPayroll } from "@flows/allEntities/hrmPayroll.entity";
import { HrmUsers } from "@flows/allEntities/users.entity";
import { AccAssets } from "@flows/allEntities/assets.entity";
import { AccClaims } from "@flows/allEntities/claims.entity";
import { NotificationsModule } from "@flows/notifications/module/notifications.module";
import { CompanyModule } from "@flows/company/module/company.module";
import { CompanyService } from "@flows/company/service/company.service";
import { SpecialUser } from '@flows/allEntities/specialUser.entity';
import { JobInformationModule } from "@flows/jobInformation/module/jobInformation.module";
import { Candidate } from '@flows/allEntities/candidate.entity';
@Module({
  imports: [
    
    TypeOrmModule.forFeature([
      HrmEmployeeDetails,
      HrmNotifications,
      HrmConfigs,
      HrmReports,
      HrmFiles,
      HrmFolders,
      HrmNotes,
      AccAssets,
      AccClaims,
      HrmVerification,
      HrmActivityTracking,
      HrmAnnouncements,
      HrmAttendance,
      HrmBoardingTaskEmployees,
      HrmCustomerSupport,
      HrmOfferLetter,
      HrmPerformanceTask,
      HrmTalentPools,
      HrmTrainingComplete,
      hrmPayroll,
      HrmUsers,
      SpecialUser,
      Candidate
    ]),
    
    EmailsNewModule,
    TimeTrackingModule,
    APIModule,
    ImageCompressorModule,
    S3Module,
    NotificationsModule,
    JobInformationModule
    
    
    
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
