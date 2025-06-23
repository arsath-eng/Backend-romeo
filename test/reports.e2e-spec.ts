import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsModule } from '../src/reports/module/module';
import { Reports } from '../src/reports/entities/reports.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { Education } from '../src/employee/entities/education.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { EmergencyContacts } from '../src/emergencyContacts/entities/emergencyContacts.entity';
import { Notes } from '../src/notes/entities/notes.entity';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { ReportFolders } from '../src/reports/entities/reportsFolders.entity';
import { ReportAccessLevels } from '../src/reports/entities/accessLevels.entity';
import { PermanentAddress } from '../src/employee/entities/permanentAddress.entity';
import { TemporaryAddress } from '../src/employee/entities/temporaryAddress.entity';
import { AccuralLevels } from '../src/accuralLevels/entities/accuralLevels.entity';
import { reportsNew } from '../src/reports/entities/reportsNew.entity';
import { TimeOffPolicies } from '../src/settingsTimeOffTimeOffPolicies/entities/TimeOffPolicies.entity';
import { FullName } from '../src/employee/entities/fullname.entity';
import { ReportTo } from '../src/jobInformation/entities/reportTo.entity';
import { EmergencyEmail } from '../src/emergencyContacts/entities/emergencyEmail.entity';
import { EmergencyAddress } from '../src/emergencyContacts/entities/emergencyAddress.entity';
import { EmergencyPhone } from '../src/emergencyContacts/entities/emergencyPhone.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffSchedules } from '../src/timeOffShedules/entities/timeOffShedules.entity';
import { EmploymentStatuses } from '../src/settingsEmployeeFeildsEmploymentStatuses/entities/employmentStatuses.entity';
import { ApplicationQuestions } from '../src/jobOpenings/entities/applicationQuestions.entity';
import { AdditionalQuestionsChoices } from '../src/jobOpenings/entities/additionalQuestionsChoices.entity';
import { AdditionalQuestions } from '../src/jobOpenings/entities/additionalQuestions.entity';
import { JobDescription } from '../src/jobOpenings/entities/jobDescription.entity';
import { Files } from '../src/files/entities/files.entity';
import { Email } from '../src/employee/entities/email.entity';
import { WellbeingNotification } from '../src/notifications/entities/wellbeingNotification.entity';
import { WellbeingEmployees } from '../src/wellbeing/entities/wellbeingEmployees.entity';
import { Wellbeing } from '../src/settingsEmployeeWellBeing/entities/wellbeing.entity';
import { ViewList } from '../src/jobOpenings/entities/viewList.entity';
import { TrainingComplete } from '../src/trainingComplete/entities/trainingComplete.entity';
import { TrainingCategory } from '../src/training/entities/TrainingCategory.entity';
import { Training } from '../src/training/entities/training.entity';
import { TimeOffSchedulesNotes } from '../src/timeOffShedules/entities/timeOffShedulesNotes.entity';
import { TimeOffSchedulesDates } from '../src/timeOffShedules/entities/timeOffShedulesDates.entity';
import { TalentPoolsCollaboratorsMain } from '../src/talentPools/entities/talentPoolsCollabaratorsMain.entity';
import { TalentPoolsCollaborators } from '../src/talentPools/entities/talentPoolsCollabarators.entity';
import { TalentPoolsCandidates } from '../src/talentPools/entities/talentPoolsCandidates.entity';
import { TalentPools } from '../src/talentPools/entities/talentPools.entity';
import { Social } from '../src/employee/entities/social.entity';
import { SelfAssessment } from '../src/notifications/entities/selfAssessment.entity';
import { SatisfactionEmployees } from '../src/satisfaction/entities/satisfactionEmployees.entity';
import { Satisfaction } from '../src/settingsEmployeeSatisfaction/entities/satisfaction.entity';
import { RequestFeedBack } from '../src/notifications/entities/requestFeedBack.entity';
import { RemoveNoPay } from '../src/notifications/entities/removeNoPay.entity';
import { AdjustTimeOffBalance } from '../src/adjustTimeOffBalance/entities/adjustTimeOffBalance.entity';
import { Announcements } from '../src/announcement/entities/announcements.entity';
import { Assets } from '../src/assets/entities/assets.entity';
import { attendance } from '../src/attendance/entities/attendance.entity';
import { AuthService } from '../src/auth/service/auth.service';
import { Benefits } from '../src/benefits/entities/benefits.entity';
import { BenefitsDependents } from '../src/benefits/entities/benefitsDependents.entity';
import { BenefitsEmployee } from '../src/benefits/entities/benefitsEmployee.entity';
import { BenefitsHistoryEmployee } from '../src/benefits/entities/benefitsHistoryEmployee.entity';
import { CandidatesComments } from '../src/candidatesComments/entities/candidatesComments.entity';
import { CandidatesReplies } from '../src/candidatesComments/entities/candidatesReplies.entity';
import { CandidatesEmails } from '../src/candidatesEmails/entities/candidatesEmails.entity';
import { CandidatesHistory } from '../src/candidatesHistory/entities/candidatesHistory.entity';
import { CandidatesHistoryActivity } from '../src/candidatesHistory/entities/candidatesHistoryActivity.entity';
import { CompanyLinks } from '../src/companyLinks/entities/companyLinks.entity';
import { CompanyLinksCategories } from '../src/companyLinks/entities/companyLinksCategories.entity';
import { CompanyLogo } from '../src/companyLogo/entities/companyLogoDocuments.entity';
import { CompanyLogoFolders } from '../src/companyLogo/entities/companyLogoFolders.entity';
import { Phone } from '../src/employee/entities/phone.entity';
import { EmployeeModule } from '../src/employee/module/employee.module';
import { EmployeeService } from '../src/employee/service/employee.service';
import { FilesFolders } from '../src/files/entities/filesFolders.entity';
import { Goals } from '../src/goals/entities/goals.entity';
import { GoalsComments } from '../src/goals/entities/goalsComments.entity';
import { Collobarators } from '../src/jobOpenings/entities/collobarators.entity';
import { CollobaratorsMain } from '../src/jobOpenings/entities/collobaratorsMain.entity';
import { Creator } from '../src/jobOpenings/entities/creator.entity';
import { JobApplication } from '../src/jobOpenings/entities/jobApplication.entity';
import { JobApplicationStatus } from '../src/jobOpenings/entities/jobApplicationStatus.entity';
import { JobOpeningsMain } from '../src/jobOpenings/entities/jobOpeningMain.entity';
import { PostJob } from '../src/jobOpenings/entities/postJob.entity';
import { AddNoPay } from '../src/notifications/entities/addNoPay.entity';
import { AnnouncementNotifications } from '../src/notifications/entities/announcementNotifications.entity';
import { CompensationChangedData } from '../src/notifications/entities/compensationChangedData.entity';
import { CompensationFormData } from '../src/notifications/entities/compensationFormData.entity';
import { CompensationMainData } from '../src/notifications/entities/compensationMainData.entity';
import { EmployeementStatussesChangedData } from '../src/notifications/entities/employementStatusesChangedData.entity';
import { EmployeementStatussesFormData } from '../src/notifications/entities/employementStatussesFormData.entity';
import { EmployeementStatussesMainData } from '../src/notifications/entities/employementStatussesMainData.entity';
import { GetFeedBack } from '../src/notifications/entities/getFeedBack.entity';
import { JobInfoUpdateChangedData } from '../src/notifications/entities/jobInfoUpDateChangedData.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { JobInfoUpdateFormDataReportTo } from '../src/notifications/entities/jobInfoUpdateFormDataReportTo.entity';
import { JobInfoUpdateMainData } from '../src/notifications/entities/jobInfoUpdateMainData.entity';
import { ManagerAssessment } from '../src/notifications/entities/managerAssesment.entity';
import { NoPayAlert } from '../src/notifications/entities/noPayAlert.entity';
import { OffBoarding } from '../src/notifications/entities/offBoarding.entity';
import { OnBoarding } from '../src/notifications/entities/onBoarding.entity';
import { PersonalInfoUpdateChangedData } from '../src/notifications/entities/personalInfoUpdateChangedData.entity';
import { PersonalInfoUpdateEmail } from '../src/notifications/entities/personalInfoUpdateEmail.entity';
import { PersonalInfoUpdateEmployee } from '../src/notifications/entities/personalInfoUpdateEmployee.entity';
import { PersonalInfoUpdateFullName } from '../src/notifications/entities/personalInfoUpdateFullname.entity';
import { PersonalInfoUpdatePermanentAddress } from '../src/notifications/entities/personalInfoUpdatePermanentAddress.entity';
import { PersonalInfoUpdatePhone } from '../src/notifications/entities/personalInfoUpdatePhone.entity';
import { PersonalInfoUpdateTemporaryAddress } from '../src/notifications/entities/personalInfoUpdateTemporaryAddress.entity';
import { PolicyChange } from '../src/notifications/entities/policyChange.entity';
import { PromotionCompensationChangedData } from '../src/notifications/entities/promotionCompensationChangedData.entity';
import { PromotionCompensationFormData } from '../src/notifications/entities/promotionCompensationFormData.entity';
import { PromotionJobInfoUpdateChangedData } from '../src/notifications/entities/promotionJobInfoUpDateChangedData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormDataReportTo } from '../src/notifications/entities/promotionJobInfoUpdateFormDataReportTo.entity';
import { PromotionMainData } from '../src/notifications/entities/promotionMainData.entity';
import { OffboardingTaskEmployees } from '../src/offBoarding/entities/offboardingTaskEmployees.entity';
import { offerLetter } from '../src/offer-letter/entities/offerLetter.entity';
import { offerLetterUpload } from '../src/offer-letter/entities/offerLetterUpload.entity';
import { OnboardingTaskEmployees } from '../src/onBoarding/entities/onboardingTaskEmployees.entity';
import { OnboardingTaskEmployeesComments } from '../src/onBoarding/entities/onboardingTaskEmployeesComments.entity';
import { PerformanceEmployees } from '../src/performance/entities/performanceEmployees.entity';
import { PerformanceFeedBackEmployees } from '../src/performance/entities/performanceFeedBackEmployees.entity';
import { EmailsNewService } from '../src/ses/service/emails.service';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { ApprovalsAll } from '../src/settingsApprovals/entities/approvalsAll.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { AssetsCategory } from '../src/settingsEmployeeFeildsAssetsCategory/entities/assetsCategory.entity';
import { CompensationChangeReason } from '../src/settingsEmployeeFeildsCompensationChangeReason/entities/compensationChangeReason.entity';
import { Degree } from '../src/settingsEmployeeFeildsDegree/entities/degree.entity';
import { Department } from '../src/settingsEmployeeFeildsDepartment/entities/department.entity';
import { Division } from '../src/settingsEmployeeFeildsDivision/entities/division.entity';
import { EmergencyContactRelationship } from '../src/settingsEmployeeFeildsEmergencyContactRelationship/entities/contactRelationship.entity';
import { JobTitles } from '../src/settingsEmployeeFeildsJobTitles/entities/jobTitles.entity';
import { JobTitlesEEO } from '../src/settingsEmployeeFeildsJobTitlesEEO/entities/jobTitlesEEO.entity';
import { Locations } from '../src/settingsEmployeeFeildsLocations/entities/locations.entity';
import { PayGroups } from '../src/settingsEmployeeFeildsPayGroups/entities/payGroups.entity';
import { ShirtSize } from '../src/settingsEmployeeFeildsShirtSize/entities/shirtSize.entity';
import { TerminateReason } from '../src/settingsEmployeeFeildsTerminateReason/entities/terminateReason.entity';
import { HiringCandidateSources } from '../src/settingsHiringCandidateSources/entities/HiringCandidateSources.entity';
import { HiringCandidateStatuses } from '../src/settingsHiringCandidateStatuses/entities/HiringCandidateStatuses.entity';
import { HiringEmailTemplates } from '../src/settingsHiringEmailTemplates/entities/HiringEmailTemplates.entity';
import { OffboardingCategories } from '../src/settingsOffboardingCategories/entities/offboardingCategories.entity';
import { OffboardingTask } from '../src/settingsOffboardingTask/entities/offboardingTask.entity';
import { OnboardingCategories } from '../src/settingsOnboardingCategories/entities/onboardingCategories.entity';
import { OnboardingTask } from '../src/settingsOnboardingTask/entities/onboardingTask.entity';
import { Performances } from '../src/settingsPerformance/entities/performance.entity';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { emailVerification } from '../src/login/entities/emailVerification.entity';
import { newPerformanceComment } from '../src/new-performance/entity/newPerformanceComment.entity';
import { newPerformanceTask } from '../src/new-performance/entity/newPerformanceTask.entity';
import { recoverPassword } from '../src/login/entities/recoverPassword.entity';
import { attendanceSettings } from '../src/attendance/entities/attendanceSettings.entity';
import { claimsCategories } from '../src/settingsEmployeeFeildsClaim/claimsCategories.entity';
import { payrollTypes } from '../src/payroll/entities/payrollTypes.entity';
import { usernameVerification } from '../src/employee/entities/usernameVerification.entity';

describe('Reports (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mock = {
    find: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue([]),
  };

  const mockReportsDto = {
    id: '1',
    reportName: '',
    type: '',
    creatorId: '1',
    sharedWith: [],
    schedule: [],
    filterBy: [],
    sortBy: [],
    folderIdList: [],
    reportRequired: [],
    recentlyViewed: '',
    groupBy: '',
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
    companyId: '1',
  };
  const mockReportsRepository = {
    create: jest.fn().mockResolvedValue(mockReportsDto),
    save: jest.fn().mockResolvedValue(mockReportsDto),
    find: jest.fn().mockResolvedValue([mockReportsDto]),
    findOne: jest.fn().mockResolvedValue(mockReportsDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockReportsNewDto = {
    id: '1',
    reportName: '',
    type: '',
    creatorId: '1',
    sharedWith: [],
    recentlyViewed: '',
    groupBy: '',
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
    companyId: '1',
  };
  const mockReportsNewRepository = {
    create: jest.fn().mockResolvedValue(mockReportsNewDto),
    save: jest.fn().mockResolvedValue(mockReportsNewDto),
    find: jest.fn().mockResolvedValue([mockReportsNewDto]),
    findOne: jest.fn().mockResolvedValue(mockReportsNewDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockReportFoldersDto = {
    id: '1',
    name: '',
    sharedwith: [],
    creatorId: '1',
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
    companyId: '1',
  };

  const mockReportFoldersRepository = {
    create: jest.fn().mockResolvedValue(mockReportFoldersDto),
    save: jest.fn().mockResolvedValue(mockReportFoldersDto),
    find: jest.fn().mockResolvedValue([mockReportFoldersDto]),
    findOne: jest.fn().mockResolvedValue(mockReportFoldersDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockAccessLevelsDto = {
    id: '1',
    employeeId: '1',
    reportsIdList: [],
    folderIdList: [],
    showReports: true,
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
    companyId: '1',
  };
  const mockAccessLevelsRepository = {
    find: jest.fn().mockResolvedValue([mockAccessLevelsDto]),
    findOne: jest.fn().mockResolvedValue(mockAccessLevelsDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockAccessLevelsDto),
    save: jest.fn().mockResolvedValue(mockAccessLevelsDto),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ReportsModule],
    })
      .overrideProvider(getRepositoryToken(Reports))
      .useValue(mockReportsRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Education))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyContacts))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffInformation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ReportFolders))
      .useValue(mockReportFoldersRepository)
      .overrideProvider(getRepositoryToken(ReportAccessLevels))
      .useValue(mockAccessLevelsRepository)
      .overrideProvider(getRepositoryToken(PermanentAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TemporaryAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AccuralLevels))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(reportsNew))
      .useValue(mockReportsNewRepository)
      .overrideProvider(getRepositoryToken(TimeOffPolicies))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(FullName))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ReportTo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyEmail))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyPhone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffSchedules))
      .useValue(mock)

      .overrideProvider(getRepositoryToken(EmploymentStatuses))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ApplicationQuestions))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AdditionalQuestionsChoices))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AdditionalQuestions))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobDescription))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Files))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Email))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(WellbeingNotification))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(WellbeingEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Wellbeing))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ViewList))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TrainingComplete))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TrainingCategory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Training))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffSchedulesNotes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffSchedulesDates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaboratorsMain))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaborators))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCandidates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPools))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Social))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(SelfAssessment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(SatisfactionEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Satisfaction))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(RequestFeedBack))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(RemoveNoPay))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AdjustTimeOffBalance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Announcements))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Assets))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(attendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AuthService))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Benefits))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsDependents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsHistoryEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesReplies))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesEmails))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesHistory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesHistoryActivity))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLinks))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLinksCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLogo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLogoFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Phone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(FilesFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Goals))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(GoalsComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Collobarators))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CollobaratorsMain))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Creator))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobApplication))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobApplicationStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobOpeningsMain))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PostJob))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AddNoPay))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AnnouncementNotifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(GetFeedBack))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormDataReportTo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ManagerAssessment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(NoPayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffBoarding))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnBoarding))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmail))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateFullName))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePermanentAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePhone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateTemporaryAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PolicyChange))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionCompensationChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionCompensationFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mock)
      .overrideProvider(
        getRepositoryToken(PromotionJobInfoUpdateFormDataReportTo),
      )
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(offerLetter))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(offerLetterUpload))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployeesComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PerformanceEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PerformanceFeedBackEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmailsNewService))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ApprovalsAll))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ApprovalsEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AssetsCategory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationChangeReason))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Degree))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Department))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Division))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyContactRelationship))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobTitles))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobTitlesEEO))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Locations))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PayGroups))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ShirtSize))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TerminateReason))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringCandidateSources))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringCandidateStatuses))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringEmailTemplates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Performances))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffCategory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(emailVerification))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(newPerformanceComment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(newPerformanceTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(recoverPassword))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(attendanceSettings))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(claimsCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(payrollTypes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(usernameVerification))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/generate-reports (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/generate-reports')
      .expect(200)
      .send({mockReportsDto})
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/reports (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/reports')
      .expect(200)
      .send(mockReportsDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/get-reports (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/get-reports')
      .expect(200)
      .expect([mockReportsDto]);
  });

  it(':companyId/report-list (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/report-list')
      .expect(200)
      .expect([mockReportsNewDto]);
  });

  it('get-reports/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/get-reports/1')
      .expect(201)
      .expect(mockReportsDto);
  });

  it('reports/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/reports/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('reports/manage-reports/change (PUT)', () => {
    return request(app.getHttpServer())
      .put('/reports/manage-reports/change')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('reports/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/reports/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('reports/manage-reports/delete (PUT)', () => {
    return request(app.getHttpServer())
      .put('/reports/manage-reports/delete')
      .expect(200)
      .send({
        idList: [],
      })
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/reports-folders (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/reports-folders')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/reports-folders (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/reports-folders')
      .expect(200)
      .expect([mockReportFoldersDto]);
  });

  it('reports-folders/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/reports-folders/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('reports-folders/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/reports-folders/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/access-levels/reports/employees (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/access-levels/reports/employees')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/access-levels/reports/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/access-levels/reports/employees')
      .expect(200)
      .expect([mockAccessLevelsDto]);
  });

  it('access-levels/reports/employees/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/access-levels/reports/employees/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
