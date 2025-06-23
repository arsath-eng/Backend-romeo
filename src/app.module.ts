import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { Connection } from 'typeorm';

import { EmployeeModule } from './employee/module/employee.module';
import { EmployeeStatusModule } from './employeeStatus/module/employeeStatus.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobInformationModule } from './jobInformation/module/jobInformation.module';
import { NotesModule } from './notes/module/notes.module';
import { EmergencyContactsModule } from './emergencyContacts/module/emergencyContacts.module';
import { CompanyModule } from './company/module/company.module';
import { NotificationsModule } from './notifications/module/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocumentsModule } from './documents/module/documents.module';
import { FilesModule } from './files/module/files.module';
import { DegreeModule } from './settingsEmployeeFeildsDegree/module/module';
import { DepartmentModule } from './settingsEmployeeFeildsDepartment/module/module';
import { DivisionModule } from './settingsEmployeeFeildsDivision/module/module';
import { EmergencyContactRelationshipModule } from './settingsEmployeeFeildsEmergencyContactRelationship/module/module';
import { EmploymentStatusesModule } from './settingsEmployeeFeildsEmploymentStatuses/module/module';
import { JobTitlesModule } from './settingsEmployeeFeildsJobTitles/module/module';
import { LocationsModule } from './settingsEmployeeFeildsLocations/module/module';
import { TerminateReasonModule } from './settingsEmployeeFeildsTerminateReason/module/module';
import { ShirtSizeModule } from './settingsEmployeeFeildsShirtSize/module/module';
import { HiringCandidateStatusesModule } from './settingsHiringCandidateStatuses/module/module';
import { HiringCandidateSourcesModule } from './settingsHiringCandidateSources/module/module';
import { AccessLevelsEmployeesModule } from './settingsAccessLevelsEmployees/module/module';
import { ApprovalsEmployeesModule } from './settingsApprovalsEmployees/module/module';
import { ReportsModule } from './reports/module/module';
import { EmailsNewModule } from './ses/module/emails.module';
import { AnnouncementsModule } from './announcement/module/announcements.module';
import { CompanyLinksModule } from './companyLinks/module/companyLinks.module';
import { CelebrationsModule } from './celebrations/module/celebrations.module';
import { HiringEmailTemplatesModule } from './settingsHiringEmailTemplates/module/module';
import { FileStreamingModule } from './fileStreaming/module/fileStreaming.module';
import { S3Module } from './s3/module/module';
import { AssetsCategoryModule } from './settingsEmployeeFeildsAssetsCategory/module/module';
import { AssetsModule } from './assets/module/assets.module';
// import { TrainingModule } from './training/module/module';
import { TrainingCompleteModule } from './trainingComplete/module/trainingComplete.module';
import { OnboardingCategoriesModule } from './settingsOnboardingCategories/module/module';
// import { OnboardingTaskModule } from './settingsOnboardingTask/module/module';
import { OnboardingTaskEmployeesModule } from './onBoarding/module/module';
import { OffboardingTaskEmployeesModule } from './offBoarding/module/module';
import { OffboardingCategoriesModule } from './settingsOffboardingCategories/module/module';
import { OffboardingTaskModule } from './settingsOffboardingTask/module/module';
import { CompanyLogoModule } from './companyLogo/module/companyLogo.module';
import { OfferLetterModule } from './offer-letter/module/offer-letter.module';
import { AttendanceModule } from './attendance/module/attendance.module';
import { CustomerSupportModule } from './customer-support/module/customer-support.module';
import { NewPerformanceModule } from './new-performance/module/new-performance.module';
import { TimezoneModule } from './timezone/timezone.module';
import { ClaimsModule } from './claims/claims.module';
import { SearchModule } from './search/search.module';
import { ClaimsCategoryModule } from './settingsEmployeeFeildsClaim/claimCategory.module';
import { APIModule } from './superAdminPortalAPI/APIservice.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

import { dataSourceOptions } from 'db/data-source';
import { ImageCompressorModule } from './image-compressor/image-compressor.module';
import { SocketModule } from './socket/socket.module';
import { PdfService } from './pdf/pdf.service';
import { PdfController } from './pdf/pdf.controller';
import { PdfModule } from './pdf/pdf.module';

import { CandidatesCommentsModule } from './candidatesComments/module/candidatesComments.module';

import { ZipModule } from './zip/zip.module';
import { ZipService } from './zip/zip.service';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { SurveyModule } from './survey/module/survey.module';
import { LeaveManagementService } from './leave-management/leave-management.service';
import { LeaveManagementModule } from './leave-management/leave-management.module';
import { LeaveManagementController } from './leave-management/leave-management.controller';
import { RosterhModule } from './Roster/roster.module';
import { AccessLevelsService } from './access-levels/access-levels.service';
import { AccessLevelsController } from './access-levels/access-levels.controller';
import { AccessLevelsModule } from './access-levels/access-levels.module';

import { onboardingTemplateModule } from './onboardingTemplate/module/onboardingTemplate.module';
import { onboardingTaskModule } from './onboardingTask/module/onboardingTask.module';
import { HolidayService } from './holiday/holiday.service';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayModule } from './holiday/holiday.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {AbaFileModule } from './aba-file/module/abaFile.module';
import { PartnerPortalModule } from './partner-portal/partner-portal.module';
import {HiringModule} from 'src/Hiring/module/hiring.module'

import { AppraisalService } from './appraisal/appraisal.service';
import { AppraisalController } from './appraisal/appraisal.controller';
import { AppraisalModule } from './appraisal/appraisal.module';


import { TrainingsModule } from 'src/training-new/module/training.module';
import { SettingEmployeeModule } from 'src/settingEmployee/module/settingEmployee.module';
import {HRLetterModule} from 'src/hrLetter/module/hrLetter.module'
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    SocketModule,
    PassportModule.register({}),
    CacheModule.register(),
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: async () =>
    //     Object.assign(await getConnectionOptions(), {
    //       autoLoadEntitiesy: true,
    //       synchronize: true,
    //       extra: {
    //         validateConnection: false,
    //       },
    //     }),
    // }),
    TypeOrmModule.forRootAsync(dataSourceOptions),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    ScheduleModule.forRoot(),
    RosterhModule,
    EmployeeModule,
    EmployeeStatusModule,
    JobInformationModule,
    NotesModule,
    EmergencyContactsModule,
    CompanyModule,
    NotificationsModule,
    DocumentsModule,
    FilesModule,
    DegreeModule,
    DepartmentModule,
    DivisionModule,
    EmergencyContactRelationshipModule,
    EmploymentStatusesModule,
    JobTitlesModule,
    LocationsModule,
    TerminateReasonModule,
    ShirtSizeModule,
    HiringCandidateStatusesModule,
    HiringCandidateSourcesModule,
    AccessLevelsModule,
    AccessLevelsEmployeesModule,
    ApprovalsEmployeesModule,
    ReportsModule,
    EmailsNewModule,
    AnnouncementsModule,
    CompanyLinksModule,
    CelebrationsModule,
    HiringEmailTemplatesModule,
    FileStreamingModule,
    S3Module,
    AssetsCategoryModule,
    AssetsModule,
    // TrainingModule,
    TrainingCompleteModule,
    OnboardingCategoriesModule,
    onboardingTaskModule,
    OnboardingTaskEmployeesModule,
    OffboardingTaskEmployeesModule,
    OffboardingCategoriesModule,
    OffboardingTaskModule,
    CompanyLogoModule,
    TimeTrackingModule,
    OfferLetterModule,
    AttendanceModule,
    CustomerSupportModule,
    NewPerformanceModule,
    TimezoneModule,
    ClaimsModule,
    ClaimsCategoryModule,
    APIModule,
    SearchModule,
    ImageCompressorModule,
    PdfModule,
    CandidatesCommentsModule,
    ZipModule,
    SurveyModule,
    LeaveManagementModule,
    FilesModule,
    onboardingTemplateModule,
    HolidayModule,
    AbaFileModule,
    PartnerPortalModule,
    HiringModule,
    AppraisalModule,
    TrainingsModule,
    SettingEmployeeModule,
    HRLetterModule


    
    
    
    

    
  ],
  providers: [    
    {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
    },
    PdfService,
    ZipService,
    LeaveManagementService,
    AccessLevelsService,
    HolidayService,
    AppraisalService,
    
    
    
    
    
  ],
  controllers: [PdfController, LeaveManagementController, AccessLevelsController, HolidayController, AppraisalController],
})
export class AppModule {
  constructor(private connection: Connection) { }
}
