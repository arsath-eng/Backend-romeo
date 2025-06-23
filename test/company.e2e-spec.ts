import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportTo } from '../src/jobInformation/entities/reportTo.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { claims } from '../src/claims/claims.entity';
import { ClaimsModule } from '../src/claims/claims.module';
import { Employee } from '../src/employee/entities/employee.entity';
import { CustomerSupportModule } from '../src/customer-support/module/customer-support.module';
import { customerSupport } from '../src/customer-support/entities/customerSupport.entity';
import { EmergencyContactsModule } from '../src/emergencyContacts/module/emergencyContacts.module';
import { EmergencyAddress } from '../src/emergencyContacts/entities/emergencyAddress.entity';
import { EmergencyContacts } from '../src/emergencyContacts/entities/emergencyContacts.entity';
import { EmergencyEmail } from '../src/emergencyContacts/entities/emergencyEmail.entity';
import { EmergencyPhone } from '../src/emergencyContacts/entities/emergencyPhone.entity';
import { AccuralLevels } from '../src/accuralLevels/entities/accuralLevels.entity';
import { AdjustTimeOffBalance } from '../src/adjustTimeOffBalance/entities/adjustTimeOffBalance.entity';
import { Announcements } from '../src/announcement/entities/announcements.entity';
import { Assets } from '../src/assets/entities/assets.entity';
import { attendance } from '../src/attendance/entities/attendance.entity';
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
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { Education } from '../src/employee/entities/education.entity';
import { Email } from '../src/employee/entities/email.entity';
import { FullName } from '../src/employee/entities/fullname.entity';
import { PermanentAddress } from '../src/employee/entities/permanentAddress.entity';
import { Phone } from '../src/employee/entities/phone.entity';
import { Social } from '../src/employee/entities/social.entity';
import { TemporaryAddress } from '../src/employee/entities/temporaryAddress.entity';
import { usernameVerification } from '../src/employee/entities/usernameVerification.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { Files } from '../src/files/entities/files.entity';
import { FilesFolders } from '../src/files/entities/filesFolders.entity';
import { Goals } from '../src/goals/entities/goals.entity';
import { GoalsComments } from '../src/goals/entities/goalsComments.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { AdditionalQuestions } from '../src/jobOpenings/entities/additionalQuestions.entity';
import { AdditionalQuestionsChoices } from '../src/jobOpenings/entities/additionalQuestionsChoices.entity';
import { ApplicationQuestions } from '../src/jobOpenings/entities/applicationQuestions.entity';
import { Collobarators } from '../src/jobOpenings/entities/collobarators.entity';
import { CollobaratorsMain } from '../src/jobOpenings/entities/collobaratorsMain.entity';
import { Creator } from '../src/jobOpenings/entities/creator.entity';
import { JobApplication } from '../src/jobOpenings/entities/jobApplication.entity';
import { JobApplicationStatus } from '../src/jobOpenings/entities/jobApplicationStatus.entity';
import { JobDescription } from '../src/jobOpenings/entities/jobDescription.entity';
import { JobOpeningsMain } from '../src/jobOpenings/entities/jobOpeningMain.entity';
import { PostJob } from '../src/jobOpenings/entities/postJob.entity';
import { ViewList } from '../src/jobOpenings/entities/viewList.entity';
import { emailVerification } from '../src/login/entities/emailVerification.entity';
import { recoverPassword } from '../src/login/entities/recoverPassword.entity';
import { Notes } from '../src/notes/entities/notes.entity';
import { AddNoPay } from '../src/notifications/entities/addNoPay.entity';
import { AnnouncementNotifications } from '../src/notifications/entities/announcementNotifications.entity';
import { CompensationChangedData } from '../src/notifications/entities/compensationChangedData.entity';
import { CompensationFormData } from '../src/notifications/entities/compensationFormData.entity';
import { CompensationMainData } from '../src/notifications/entities/compensationMainData.entity';
import { EmployeementStatussesChangedData } from '../src/notifications/entities/employementStatusesChangedData.entity';
import { EmployeementStatussesFormData } from '../src/notifications/entities/employementStatussesFormData.entity';
import { EmployeementStatussesMainData } from '../src/notifications/entities/employementStatussesMainData.entity';
import { GetFeedBack } from '../src/notifications/entities/getFeedBack.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
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
import { RemoveNoPay } from '../src/notifications/entities/removeNoPay.entity';
import { RequestFeedBack } from '../src/notifications/entities/requestFeedBack.entity';
import { SelfAssessment } from '../src/notifications/entities/selfAssessment.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { WellbeingNotification } from '../src/notifications/entities/wellbeingNotification.entity';
import { OffboardingTaskEmployees } from '../src/offBoarding/entities/offboardingTaskEmployees.entity';
import { offerLetter } from '../src/offer-letter/entities/offerLetter.entity';
import { offerLetterUpload } from '../src/offer-letter/entities/offerLetterUpload.entity';
import { OnboardingTaskEmployees } from '../src/onBoarding/entities/onboardingTaskEmployees.entity';
import { OnboardingTaskEmployeesComments } from '../src/onBoarding/entities/onboardingTaskEmployeesComments.entity';
import { PerformanceEmployees } from '../src/performance/entities/performanceEmployees.entity';
import { PerformanceFeedBackEmployees } from '../src/performance/entities/performanceFeedBackEmployees.entity';
import { ReportAccessLevels } from '../src/reports/entities/accessLevels.entity';
import { ReportFolders } from '../src/reports/entities/reportsFolders.entity';
import { Reports } from '../src/reports/entities/reports.entity';
import { SatisfactionEmployees } from '../src/satisfaction/entities/satisfactionEmployees.entity';
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
import { EmploymentStatuses } from '../src/settingsEmployeeFeildsEmploymentStatuses/entities/employmentStatuses.entity';
import { JobTitles } from '../src/settingsEmployeeFeildsJobTitles/entities/jobTitles.entity';
import { JobTitlesEEO } from '../src/settingsEmployeeFeildsJobTitlesEEO/entities/jobTitlesEEO.entity';
import { Locations } from '../src/settingsEmployeeFeildsLocations/entities/locations.entity';
import { PayGroups } from '../src/settingsEmployeeFeildsPayGroups/entities/payGroups.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { ShirtSize } from '../src/settingsEmployeeFeildsShirtSize/entities/shirtSize.entity';
import { TerminateReason } from '../src/settingsEmployeeFeildsTerminateReason/entities/terminateReason.entity';
import { Satisfaction } from '../src/settingsEmployeeSatisfaction/entities/satisfaction.entity';
import { Wellbeing } from '../src/settingsEmployeeWellBeing/entities/wellbeing.entity';
import { HiringCandidateSources } from '../src/settingsHiringCandidateSources/entities/HiringCandidateSources.entity';
import { HiringCandidateStatuses } from '../src/settingsHiringCandidateStatuses/entities/HiringCandidateStatuses.entity';
import { HiringEmailTemplates } from '../src/settingsHiringEmailTemplates/entities/HiringEmailTemplates.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { OffboardingCategories } from '../src/settingsOffboardingCategories/entities/offboardingCategories.entity';
import { OffboardingTask } from '../src/settingsOffboardingTask/entities/offboardingTask.entity';
import { OnboardingCategories } from '../src/settingsOnboardingCategories/entities/onboardingCategories.entity';
import { OnboardingTask } from '../src/settingsOnboardingTask/entities/onboardingTask.entity';
import { Performances } from '../src/settingsPerformance/entities/performance.entity';
import { TimeOffPolicies } from '../src/settingsTimeOffTimeOffPolicies/entities/TimeOffPolicies.entity';
import { TalentPools } from '../src/talentPools/entities/talentPools.entity';
import { TalentPoolsCandidates } from '../src/talentPools/entities/talentPoolsCandidates.entity';
import { TalentPoolsCollaborators } from '../src/talentPools/entities/talentPoolsCollabarators.entity';
import { TalentPoolsCollaboratorsMain } from '../src/talentPools/entities/talentPoolsCollabaratorsMain.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { TimeOffSchedules } from '../src/timeOffShedules/entities/timeOffShedules.entity';
import { TimeOffSchedulesDates } from '../src/timeOffShedules/entities/timeOffShedulesDates.entity';
import { TimeOffSchedulesNotes } from '../src/timeOffShedules/entities/timeOffShedulesNotes.entity';
import { Training } from '../src/training/entities/Training.entity';
import { TrainingCategory } from '../src/training/entities/TrainingCategory.entity';
import { TrainingComplete } from '../src/trainingComplete/entities/trainingComplete.entity';
import { WellbeingEmployees } from '../src/wellbeing/entities/wellbeingEmployees.entity';
import { EmployeeModule } from '../src/employee/module/employee.module';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
import { CompanyModule } from '../src/company/module/company.module';
import { reportsNew } from '../src/reports/entities/reportsNew.entity';
import { newPerformanceComment } from '../src/new-performance/entity/newPerformanceComment.entity';
import { newPerformanceTask } from '../src/new-performance/entity/newPerformanceTask.entity';
import { attendanceSettings } from '../src/attendance/entities/attendanceSettings.entity';
import { claimsCategories } from '../src/settingsEmployeeFeildsClaim/claimsCategories.entity';
import { payrollTypes } from '../src/payroll/entities/payrollTypes.entity';
import { AccuralLevelsDto } from '../src/accuralLevels/dto/accuralLevels.dto';
import { EmailsNewService } from '../src/ses/service/emails.service';
const globalPrefix = 'app/v1';

describe('CompanyController (e2e)', () => {
  let app: INestApplication;
  let timeOffCategoryDto = {
    id: '',
    timeoffNo: '',
    name: '',
    units: '',
    icon: '',
    type: '',
    fileUpload: true,
    fileRequiredLimit: 1,
    noPay: true,
    coverupPerson: true,
    color: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let timeOffRequestNotificationDatesDto = {
    id: '',
    timeoffRequestDataId: '',
    date: '',
    amount: 1.0,
  };
  let jobOpeningMainDto = {
    id: '',
    postingTitle: '',
    jobStatus: '',
    hiringLead: '',
    department: '',
    employmentType: '',
    minimumExperience: '',
    location: '',
    country: '',
    city: '',
    province: '',
    postalCode: '',
    compensation: '',
    internalJobCode: '',
    jobCategory: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    creator: {},
    postJob: {},
    jobDescription: {},
    jobApplication: {},
  };
  let announcementNotificationDto = {
    id: '',
    data: {
      id: '',
    },
    hidden: true,
    createdAt: '',
    modifiedAt: '',
  };
  let addNoPayDto = {
    id: '',
    data: {
      employeeId: '',
    },
    createdAt: '',
    modifiedAt: '',
  };
  let sapPackagesDto = {
    id: '',
    name: '',
    defaultUserCount: '',
    costMethod: '',
    productId: '',
    discount: '',
    discountInYearly: true,
    features: [],
    createdAt: '',
    modifiedAt: '',
  };
  let sapCompanyFeatures = {
    id: '',
    effectiveDate: '',
    companyId: '',
    defaultUserCount: '',
    packageId: '',
    expiredDate: '',
    billingPeriod: '',
    status: '',
    features: [],
    cost: '',
    comment: '',
    discount: '',
    stripeSubscriptionId: '',
    type: '',
    emails: [],
    customPackage: true,
    createdAt: '',
    modifiedAt: '',
  };
  let sapConfigFeaturesDto = {
    id: '',
    name: '',
    count: 1,
    countableItem: '',
    slug: '',
    category: '',
    status: '',
    description: '',
    createdAt: '',
    modifiedAt: '',
  };
  let accrualLevelsDto = {
    id: '',
    employeeId: '',
    employeeName: '',
    companyId: '',
    date: new Date(),
    policyId: '',
    activated: true,
    createdAt: '',
    modifiedAt: '',
  };
  let usernameVerificationDto = {
    id: '',
    username: 'test@example.com',
    token: '',
    employeeId: '',
    canUse: true,
    createdAt: '',
    modifiedAt: '',
  };
  let educationDto = {
    id: '',
    employeeId: '',
    institute: '',
    degree: '',
    feild: '',
    grade: '',
    startDate: '',
    endDate: '',
  };
  let accessLevelsEmployeesDto = {
    id: '',
    employeeId: '',
    accessLevelId: '',
    lastLogin: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let accessLevelsDto = {
    id: '',
    accessLevelName: '',
    accessLevelType: '',
    access: {
      otherProfile: {
        method: {
          ACCESS: true,
          LEVEL: 'ALL',
        },
      },
    },
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let employeeStatusDto = {
    id: '',
    employeeId: '',
    effectiveDate: '',
    status: '',
    comment: '',
    terminateReason: '',
    active: true,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let jobInformationDto = {
    id: '',
    employeeId: '',
    effectiveDate: '',
    jobTitle: '',
    location: '',
    department: '',
    division: '',
    active: true,
    reportTo: {
      id: '',
      employeeId: '',
      reporterId: '',
      reporterName: '',
      companyId: '',
    },
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let commonDto = {
    data: {
      employeeId: '',
      id: '',
    },
    address: {
      id: '',
    },
    email: {
      id: '',
    },
    phone: {
      id: '',
    },
    status: {
      id: '',
    },
  };
  let timeoffPolicyDto = {
    id: '',
    policyName: '',
    type: '',
    employementStatus: '',
    startDate: 1,
    effectiveDate: '',
    categories: {},
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let approvalsAllDto = {
    id: '',
    name: '',
    list: [],
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let RecoverPasswordDto = {
    id: '',
    userName: '',
    employeeId: '',
    canUse: false,
    createdAt: '',
    modifiedAt: '',
  };
  let companyDto = {
    id: '',
    companyName: '',
    stripeCustomerId: '',
    initialEmail: '',
    paymentLink: '',
    noEmp: '',
    country: '',
    heroLogoURL: '',
    logoURL: '',
    paidStatus: '',
    status: '',
    features: [],
    addonFeatures: [],
    theme: '',
    trialActive: true,
    demoData: true,
    createdAt: '',
    modifiedAt: '',
    waitingPeriod: true,
    timezone: 'Asia/Colombo',
    waitingPeriodStartDate: '',
    addonStatus: true,
    employeeAddStatus: true,
    currency: '',
  };
  let superAdminEmailCountDto = {
    id: '',
    companyId: '',
    count: 1,
    type: '',
    createdAt: '',
    modifiedAt: '',
  };
  let locationDto = {
    id: '',
    name: '',
    remoteAddress: '',
    streetOne: '',
    streetTwo: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    timezone: '',
    createdAt: '',
    modifiedAt: 'Date',
    companyId: '',
  };
  let employeeDto = {
    permanentAddress: {
      id: '',
    },
    phone: {
      work: 123,
    },
    email: {
      work: '',
    },
    fullName: {
      first: '',
      last: '',
    },
    employeeId: '',
    timezone: '',
    username: 'test@example.com',
    password: '#123',
    getStarted: '',
    emailVerified: '',
    employeeNo: 1,
    access: true,
    status: '',
    birthday: '',
    gender: '',
    maritalStatus: '',
    passportNumber: '',
    taxfileNumber: '',
    nin: '',
    vaccinated: true,
    doses: 1,
    reason: '',
    owner: true,
    hireDate: '2022-12-13',
    terminationDate: '',
    ethnicity: '',
    eeoCategory: '',
    shirtSize: '',
    allergies: '',
    dietaryRestric: '',
    secondaryLang: '',
    createdAt: '',
    modifiedAt: '',
    preferedName: '',
    online: false,
    profileImage: '',
  };
  let EmergencyEmailDto = {
    id: '',
    email: '',
  };
  let EmergencyAddressDto = {
    id: '',
    no: '',
    street: '',
    city: '',
    state: '',
    zip: 11111,
    country: '',
  };
  let EmergencyPhoneDto = {
    id: '',
    work: 1234,
    mobile: 1234,
    home: 1234,
  };
  let EmergencyContactsDto = {
    id: '',
    employeeId: '',
    name: '',
    relationship: '',
    primary: false,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    email: EmergencyEmailDto,
    address: EmergencyAddressDto,
    phone: EmergencyPhoneDto,
  };
  let getEmergencyContactsDto = {
    contacts: [EmergencyContactsDto],
    employeeId: '',
  };
  let getEmergencyContactsByIdDto = {
    contacts: [EmergencyContactsDto],
    employeeId: ':id',
  };

  let mock = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(commonDto),
    find: jest.fn().mockResolvedValue([commonDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(1),
    findOneOrFail: jest.fn().mockResolvedValue(commonDto),
  };
  const mockEmployee = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(employeeDto),
    find: jest.fn().mockResolvedValue([employeeDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(employeeDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmergencyContacts = {
    findOne: jest.fn().mockResolvedValue(EmergencyContactsDto),
    find: jest.fn().mockResolvedValue([EmergencyContactsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(EmergencyContactsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmergencyEmail = {
    findOne: jest.fn().mockResolvedValue(EmergencyEmailDto),
    find: jest.fn().mockResolvedValue([EmergencyEmailDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(EmergencyEmailDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockRecoverPassword = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(RecoverPasswordDto),
    find: jest.fn().mockResolvedValue([RecoverPasswordDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(RecoverPasswordDto),
    findOneOrFail: jest.fn().mockResolvedValue(RecoverPasswordDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAPIService = {
    getCompanyById: jest.fn().mockResolvedValue(companyDto),
    getSuperAdminEmailCount: jest
      .fn()
      .mockResolvedValue(superAdminEmailCountDto),
    postSuperAdminEmailCount: jest
      .fn()
      .mockResolvedValue(superAdminEmailCountDto),
    updateStripeCustomerEmail: jest
      .fn()
      .mockResolvedValue({ statusCode: 200, description: 'success' }),
    getAllCompanies: jest.fn().mockResolvedValue([companyDto]),
    getSuperAdminConfigFeatureById: jest
      .fn()
      .mockResolvedValue(sapConfigFeaturesDto),
    getActiveSuperAdminCompanyFeatures: jest
      .fn()
      .mockResolvedValue(sapCompanyFeatures),
    addStripeCustomer: jest.fn().mockResolvedValue({ id: '' }),
    getSuperAdminPackagesEnterprise: jest
      .fn()
      .mockResolvedValue(sapPackagesDto),
    postCompany: jest.fn().mockResolvedValue({ id: '' }),
    postSuperAdminCompanyFeatures: jest.fn().mockResolvedValue({}),
    getTestCompanyByEmail: jest.fn().mockResolvedValue({
      id: '',
      email: '',
      createdAt: '',
      modifiedAt: '',
    }),
    postCoupons: jest.fn().mockResolvedValue({}),
    postCouponsEmailSend: jest.fn().mockResolvedValue({}),
    getSuperAdminPackagesById: jest.fn().mockResolvedValue(sapPackagesDto),
    addTrialSubscription: jest.fn().mockResolvedValue({ id: '' }),
    getCompanyByName: jest.fn().mockResolvedValue(companyDto),
    getActivePackageSuperAdminCompanyFeatures: jest
      .fn()
      .mockResolvedValue(sapCompanyFeatures),
    getActiveAddonSuperAdminCompanyFeatures: jest
      .fn()
      .mockResolvedValue(sapCompanyFeatures),
    deleteCompanyById: jest.fn().mockResolvedValue({}),
    deleteCompanyUnsubscribeByCompanyId: jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyEmail: jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyFeatures: jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyRefund: jest.fn().mockResolvedValue({}),
  };
  const mockEmailsNewService = {
    sendUserConfirmation: jest.fn().mockResolvedValue({}),
  };
  const mockApprovalsAll = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(approvalsAllDto),
    find: jest.fn().mockResolvedValue([approvalsAllDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(approvalsAllDto),
    findOneOrFail: jest.fn().mockResolvedValue(approvalsAllDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformation = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(jobInformationDto),
    find: jest.fn().mockResolvedValue([jobInformationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(jobInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobInformationDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockLocation = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(locationDto),
    find: jest.fn().mockResolvedValue([locationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(locationDto),
    findOneOrFail: jest.fn().mockResolvedValue(locationDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockTimeoffPolicy = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(timeoffPolicyDto),
    find: jest.fn().mockResolvedValue([timeoffPolicyDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(timeoffPolicyDto),
    findOneOrFail: jest.fn().mockResolvedValue(timeoffPolicyDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeStatus = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(employeeStatusDto),
    find: jest.fn().mockResolvedValue([employeeStatusDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(employeeStatusDto),
    findOneOrFail: jest.fn().mockResolvedValue(employeeStatusDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAccessLevelEmployees = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(accessLevelsEmployeesDto),
    find: jest.fn().mockResolvedValue([accessLevelsEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(accessLevelsEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue(accessLevelsEmployeesDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAccessLevels = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(accessLevelsDto),
    find: jest.fn().mockResolvedValue([accessLevelsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(accessLevelsDto),
    findOneOrFail: jest.fn().mockResolvedValue(accessLevelsDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockEducation = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(educationDto),
    find: jest.fn().mockResolvedValue([educationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(educationDto),
    findOneOrFail: jest.fn().mockResolvedValue(educationDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockUsernameVerification = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(usernameVerificationDto),
    find: jest.fn().mockResolvedValue([usernameVerificationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(usernameVerificationDto),
    findOneOrFail: jest.fn().mockResolvedValue(usernameVerificationDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAccrualLevels = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(accrualLevelsDto),
    find: jest.fn().mockResolvedValue([accrualLevelsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(accrualLevelsDto),
    findOneOrFail: jest.fn().mockResolvedValue(accrualLevelsDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAddNoPay = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(addNoPayDto),
    find: jest.fn().mockResolvedValue([addNoPayDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(addNoPayDto),
    findOneOrFail: jest.fn().mockResolvedValue(addNoPayDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAnnouncementNotification = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(announcementNotificationDto),
    find: jest.fn().mockResolvedValue([announcementNotificationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(announcementNotificationDto),
    findOneOrFail: jest.fn().mockResolvedValue(announcementNotificationDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobOpeningMain = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(jobOpeningMainDto),
    find: jest.fn().mockResolvedValue([jobOpeningMainDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(jobOpeningMainDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobOpeningMainDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockTimeOffRequestNotificationDates = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(timeOffRequestNotificationDatesDto),
    find: jest.fn().mockResolvedValue([timeOffRequestNotificationDatesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(timeOffRequestNotificationDatesDto),
    findOneOrFail: jest
      .fn()
      .mockResolvedValue(timeOffRequestNotificationDatesDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockTimeOffCategory = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(timeOffCategoryDto),
    find: jest.fn().mockResolvedValue([timeOffCategoryDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue(timeOffCategoryDto),
    findOneOrFail: jest.fn().mockResolvedValue(timeOffCategoryDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockAuthGuard = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CompanyModule],
    })

      .overrideProvider(getRepositoryToken(payrollTypes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(claimsCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(attendanceSettings))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(newPerformanceTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(newPerformanceComment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(reportsNew))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(FullName))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Email))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Education))
      .useValue(mockEducation)
      .overrideProvider(getRepositoryToken(PermanentAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Phone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Social))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TemporaryAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ReportTo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformation)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatus)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ApprovalsEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mockAccessLevelEmployees)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mockAccessLevels)
      .overrideProvider(getRepositoryToken(AccuralLevels))
      .useValue(mockAccrualLevels)
      .overrideProvider(getRepositoryToken(TimeOffPolicies))
      .useValue(mockTimeoffPolicy)
      .overrideProvider(getRepositoryToken(TimeOffCategory))
      .useValue(mockTimeOffCategory)
      .overrideProvider(getRepositoryToken(TimeOffInformation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ReportAccessLevels))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ApprovalsAll))
      .useValue(mockApprovalsAll)
      .overrideProvider(getRepositoryToken(Benefits))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnBoarding))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffBoarding))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(recoverPassword))
      .useValue(mockRecoverPassword)
      .overrideProvider(getRepositoryToken(TimeOffSchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmploymentStatuses))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyAddress))
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
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mockTimeOffRequestNotificationDates)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaboratorsMain))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaborators))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPoolsCandidates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TalentPools))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(SelfAssessment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(SatisfactionEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Satisfaction))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(RequestFeedBack))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Reports))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ReportFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(RemoveNoPay))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionMainData))
      .useValue(mock)
      .overrideProvider(
        getRepositoryToken(PromotionJobInfoUpdateFormDataReportTo),
      )
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionCompensationFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PromotionCompensationChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PostJob))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PolicyChange))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateTemporaryAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePhone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePermanentAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateFullName))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmail))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Performances))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PerformanceFeedBackEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PerformanceEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployeesComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OffboardingCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(NoPayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ManagerAssessment))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobTitlesEEO))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobOpeningsMain))
      .useValue(mockJobOpeningMain)
      .overrideProvider(getRepositoryToken(JobInfoUpdateMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormDataReportTo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInfoUpdateChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobApplicationStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobApplication))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(GoalsComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Goals))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(GetFeedBack))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(FilesFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeementStatussesChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyPhone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyEmail))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmergencyContacts))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Creator))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationMainData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationFormData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompensationChangedData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLogoFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLogo))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLinksCategories))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CompanyLinks))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CollobaratorsMain))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Collobarators))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesReplies))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesHistoryActivity))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesHistory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesEmails))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(CandidatesComments))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsHistoryEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(BenefitsDependents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AssetsCategory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Assets))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Announcements))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AnnouncementNotifications))
      .useValue(mockAnnouncementNotification)
      .overrideProvider(getRepositoryToken(AdjustTimeOffBalance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AddNoPay))
      .useValue(mockAddNoPay)
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
      .overrideProvider(getRepositoryToken(EmploymentStatuses))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobTitles))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Locations))
      .useValue(mockLocation)
      .overrideProvider(getRepositoryToken(TerminateReason))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PayGroups))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(ShirtSize))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringCandidateStatuses))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringCandidateSources))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HiringEmailTemplates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(attendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(offerLetterUpload))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(offerLetter))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(emailVerification))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(usernameVerification))
      .useValue(mockUsernameVerification)
      .overrideProvider(APIService)
      .useValue(mockAPIService)
      .overrideProvider(EmailsNewService)
      .useValue(mockEmailsNewService)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it(`/:companyId/homepage-common (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/homepage-common')
      .set('userid', '')
      .expect(200)
      .expect({
        timeoffCategories: [timeOffCategoryDto],
        accuralLevel: {
          ...JSON.parse(JSON.stringify(accrualLevelsDto)),
          hasPolicy: true,
          schedule: { hasSchedule: false, data: {} },
        },
        timeoffPolicy: {
          id: '',
          policyName: '',
          type: '',
          employementStatus: '',
          startDate: 1,
          effectiveDate: '',
          categories: {},
          createdAt: '',
          modifiedAt: '',
          companyId: '',
        },
        TimeoffInformation: [
          commonDto,
        ],
        tomeoffRequests: [
          {
            ...commonDto,
            dates: [timeOffRequestNotificationDatesDto],
          }
        ],
      });
  });
  it(`/company (GET)`, () => {
    return request(app.getHttpServer())
      .get('/company')
      .expect(200)
      .expect([
        {
          id: '',
          companyName: '',
          stripeCustomerId: '',
          initialEmail: '',
          paymentLink: '',
          noEmp: '',
          country: '',
          heroLogoURL: '',
          logoURL: '',
          paidStatus: '',
          status: '',
          features: [],
          addonFeatures: [],
          theme: '',
          trialActive: true,
          demoData: true,
          createdAt: '',
          modifiedAt: '',
          waitingPeriod: true,
          timezone: 'Asia/Colombo',
          waitingPeriodStartDate: '',
          addonStatus: true,
          employeeAddStatus: true,
          currency: '',
          featuresSlugs: [],
          packages: {
            id: '',
            effectiveDate: '',
            companyId: '',
            defaultUserCount: '',
            packageId: '',
            expiredDate: '',
            billingPeriod: '',
            status: '',
            features: [],
            cost: '',
            comment: '',
            discount: '',
            stripeSubscriptionId: '',
            type: '',
            emails: [],
            customPackage: true,
            createdAt: '',
            modifiedAt: '',
          },
        },
      ]);
  });
  it(`/health (GET)`, () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'active' });
  });
  it(`/company (POST)`, () => {
    return request(app.getHttpServer())
      .post('/company')
      .send({
        firstName: 'Ceshaan',
        lastName: 'Ceshaan',
        email: 'ceshaan66@example.com',
        phoneNumber: '1234567890',
        companyName: 'TEST',
        noEmp: '24',
        selectedCountry: 'Sri Lanka',
        timezone: 'Asia/Colombo',
        password: 'Aaaaa!1aaaa',
        theme: 'violet1',
        heroLogoURL:
          'https://zelora.s3.amazonaws.com/common/dummydata/company/romeohr_hero.png',
        logoURL:
          'https://zelora.s3.amazonaws.com/common/dummydata/company/romeohr_main.png',
      })
      .expect(201)
      .expect({ employeeId: '', statusCode: 200, description: 'success' });
  });
  it(`/signup/verification-step-one (POST)`, () => {
    return request(app.getHttpServer())
      .post('/signup/verification-step-one')
      .expect(201)
      .expect({
        email: 'used',
        emailVerify: true,
        emailRestricted: { emailUsed: false, data: { name: '', email: '' } },
        emailAuthorized: true,
      });
  });
  it(`/signup/verification-step-two (POST)`, () => {
    return request(app.getHttpServer())
      .post('/signup/verification-step-two')
      .expect(201)
      .expect({ phoneNumber: 'not-used', companyName: 'used' });
  });
  it(`/:companyId/company (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/company')
      .expect(200)
      .expect({
        id: '',
        companyName: '',
        stripeCustomerId: '',
        initialEmail: '',
        paymentLink: '',
        noEmp: '',
        country: '',
        heroLogoURL: '',
        logoURL: '',
        paidStatus: '',
        status: '',
        features: [],
        addonFeatures: [],
        theme: '',
        trialActive: true,
        demoData: true,
        createdAt: '',
        modifiedAt: '',
        waitingPeriod: true,
        timezone: 'Asia/Colombo',
        waitingPeriodStartDate: '',
        addonStatus: true,
        employeeAddStatus: true,
        currency: '',
        featuresSlugs: [],
        packages: {
          id: '',
          name: '',
          defaultUserCount: '',
          costMethod: '',
          productId: '',
          discount: '',
          discountInYearly: true,
          features: [],
          createdAt: '',
          modifiedAt: '',
        },
        access: [],
      });
  });
  it(`/company/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/company/:id')
      .send({
        firstName: 'Ceshaan',
        lastName: 'Ceshaan',
        email: 'ceshaan66@example.com',
        phoneNumber: '1234567890',
        companyName: 'TEST',
        noEmp: '24',
        selectedCountry: 'Sri Lanka',
        timezone: 'Asia/Colombo',
        password: 'Aaaaa!1aaaa',
        theme: 'violet1',
        heroLogoURL:
          'https://zelora.s3.amazonaws.com/common/dummydata/company/romeohr_hero.png',
        logoURL:
          'https://zelora.s3.amazonaws.com/common/dummydata/company/romeohr_main.png',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/company/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/company/:id')
      .send({ execute: true })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/connect-main/company/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/connect-main/company/:id')
      .send({ execute: true })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/dummy-data/:id (POST)`, () => {
    return request(app.getHttpServer())
      .post('/dummy-data/:id')
      .send({ execute: true })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/elegibility-check/:companyId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/elegibility-check/:companyId')
      .set('userid', '')
      .expect(200)
      .expect({ hasOrgEmail: true, hasActiveAcc: false });
  });
});
