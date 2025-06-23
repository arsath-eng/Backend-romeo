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
import { AttendanceModule } from "@flows/attendance/module/attendance.module";

import { CelebrationsModule } from "@flows/celebrations/module/celebrations.module";
import { EmployeeService } from "@flows/employee/service/employee.service";
import { S3Module } from "@flows/s3/module/module";
import { EmailsNewModule } from "@flows/ses/module/emails.module";
import { DepartmentModule } from "@flows/settingsEmployeeFeildsDepartment/module/module";
import { DivisionModule } from "@flows/settingsEmployeeFeildsDivision/module/module";
import { EmploymentStatusesModule } from "@flows/settingsEmployeeFeildsEmploymentStatuses/module/module";
import { LocationsModule } from "@flows/settingsEmployeeFeildsLocations/module/module";
import { APIModule } from "@flows/superAdminPortalAPI/APIservice.module";
// import { TrainingModule } from "@flows/training/module/module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanyController } from "../controller/company.controller";
import { CompanyService } from "../service/company.service";
import { EmployeeModule } from "@flows/employee/module/employee.module";
import { hrmPayroll } from "@flows/allEntities/hrmPayroll.entity";
import { JobInformationModule } from "@flows/jobInformation/module/jobInformation.module";
import { hrmHiring } from "@flows/allEntities/hrmHiring.entity";
import { SocketModule } from "@flows/socket/socket.module";
import { HrmAttendanceSummary } from "@flows/allEntities/attendanceSummary.entity";
import { TimeTrackingModule } from "@flows/time-tracking/time-tracking.module";
import { AccAssets } from "@flows/allEntities/assets.entity";
import { AccClaims } from "@flows/allEntities/claims.entity";
import { NotificationsModule } from "@flows/notifications/module/notifications.module";
import { HrmLeaveRequests } from '@flows/allEntities/leaveRequests.entity';
import { hrmSurveyQuestionnaires } from '@flows/allEntities/hrmSurveyQuestionnaires.entity';
import { HrmTimeProjects } from '@flows/allEntities/timeProjects.entity';
import { HrmTimeEntries } from '@flows/allEntities/timeEntries.entity';
import { hrmSurveySurveys } from '@flows/allEntities/hrmSurveySurveys.entity';
import {onboardingTemplate} from '@flows/allEntities/OnboardingTemplate.entity';
import {OnboardingTask} from '@flows/allEntities/OnboardingTask.entity';
import { HrmLeaveHistory } from '@flows/allEntities/leaveHistory.entity';
import { HrmLeaveBalances } from '@flows/allEntities/leaveBalances.entity';
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
      hrmHiring,
      HrmAttendanceSummary,
      HrmLeaveRequests,
      hrmSurveyQuestionnaires,
      hrmSurveySurveys,
      HrmTimeProjects,
      HrmTimeEntries,
      onboardingTemplate,
      OnboardingTask,
      HrmLeaveHistory,
      HrmLeaveBalances
    ]),
    EmailsNewModule,
    
    APIModule,
    S3Module,
    EmployeeModule,
    AttendanceModule,
    CelebrationsModule,
    EmploymentStatusesModule,
    DepartmentModule,
    LocationsModule,
    DivisionModule,
    // TrainingModule,
    JobInformationModule,
    SocketModule,
    TimeTrackingModule,
    NotificationsModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
