import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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
import { CompanyLogoModule } from '../src/companyLogo/module/companyLogo.module';
import { CompanyLogo } from '../src/companyLogo/entities/companyLogoDocuments.entity';
import { CompanyLogoFolders } from '../src/companyLogo/entities/companyLogoFolders.entity';
import { EmergencyAddressDto } from '../src/emergencyContacts/dto/emergencyAddress.dto';
import { EmergencyPhoneDto } from '../src/emergencyContacts/dto/emergencyPhone.dto';
import * as multer from 'multer';
import { S3Service } from '../src/s3/service/service';
const globalPrefix = 'app/v1';
import * as fs from 'fs';
import { MockFileInterceptor } from './__mocks__/mockFileInterceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesModule } from '../src/files/module/files.module';
import { TimeTrackingService } from '../src/time-tracking/service/time-tracking.service';
import { Files } from '../src/files/entities/files.entity';
import { filesDto } from '../src/files/dto/Files.dto';
import { FilesFolders } from '../src/files/entities/filesFolders.entity';
import { filesFoldersDto } from '../src/files/dto/FilesFolders.dto';
import { GoalsModule } from '../src/goals/module/module';
import { Goals } from '../src/goals/entities/goals.entity';
import { GoalsComments } from '../src/goals/entities/goalsComments.entity';
import { GoalsDto } from '../src/goals/dto/goals.dto';
import { GoalsCommentsDto } from '../src/goals/dto/goalsComments.dto';
import { NewPerformanceModule } from '../src/new-performance/module/new-performance.module';
import { newPerformanceTask } from '../src/new-performance/entity/newPerformanceTask.entity';
import { newPerformanceComment } from '../src/new-performance/entity/newPerformanceComment.entity';
import { NotesModule } from '../src/notes/module/notes.module';
import { Notes } from '../src/notes/entities/notes.entity';
import { NotificationsModule } from '../src/notifications/module/notifications.module';
import { Assets } from '../src/assets/entities/assets.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { AddNoPay } from '../src/notifications/entities/addNoPay.entity';
import { AnnouncementNotifications } from '../src/notifications/entities/announcementNotifications.entity';
import { assetRequestNotificationData } from '../src/notifications/entities/assetRequestNotificationData.entity';
import { AssetsNotification } from '../src/notifications/entities/assetsNotification.entity';
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
import { OnboardingTaskEmployees } from '../src/onBoarding/entities/onboardingTaskEmployees.entity';
import { PerformanceFeedBackEmployees } from '../src/performance/entities/performanceFeedBackEmployees.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { SatisfactionNotification } from '../src/settingsEmployeeSatisfaction/entities/satisfactionNotification.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { WellbeingEmployees } from '../src/wellbeing/entities/wellbeingEmployees.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
import { FullName } from '../src/employee/entities/fullname.entity';
import { PermanentAddress } from '../src/employee/entities/permanentAddress.entity';
import { TemporaryAddress } from '../src/employee/entities/temporaryAddress.entity';
import { Email } from '../src/employee/entities/email.entity';
import { Phone } from '../src/employee/entities/phone.entity';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { AccuralLevels } from '../src/accuralLevels/entities/accuralLevels.entity';
import { TimeOffPolicies } from '../src/settingsTimeOffTimeOffPolicies/entities/TimeOffPolicies.entity';
import { Social } from '../src/employee/entities/social.entity';
describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
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
  let superAdminEmailCountDto = {
    id: '',
    companyId: '',
    count: 1,
    type: '',
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
  let notificationDataDto = {
    id: '',
    data: {},
    hidden: false,
    createdAt: '',
    modifiedAt: '',
  };
  let notificationsDto = {
    id: '',
    type: 'assetRequest',
    data: {
      requesterName: '',
      employeeName: '',
      employeeId: 'userId2',
    },
    hidden: false,
    createdAt: '',
    modifiedAt: '',
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
  let reportToDto = {
    id: '',
    employeeId: 'userId2',
    reporterId: 'userId',
    reporterName: '',
    companyId: '',
  };
  let jobInformationDto = {
    id: '',
    employeeId: '',
    effectiveDate: '2022-12-12',
    jobTitle: '',
    location: '',
    department: '',
    division: '',
    active: '',
    reportTo: reportToDto,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let approvalsEmployeesDto = {
    id: '',
    employeeId: '',
    informationUpdate: '',
    timeoffUpdate: '',
    compensationApproval: '',
    compensationRequest: '',
    employementStatusApproval: '',
    employementStatusRequest: '',
    jobInformationApproval: '',
    jobInformationRequest: '',
    promotionApproval: '',
    promotionRequest: '',
    assetRequest: '',
    assetApproval: 'UNDER',
    claimRequest: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };

  let mockTimeOffPoliciesDto = {
    id: '',
    policyName: '',
    type: '',
    employementStatus: '',
    startDate: '',
    effectiveDate: '',
    categories: [],
    createdAt: '2023-09-29',
    modifiedAt: '2023-09-29',
    companyId: '1',
  };
  let mock = {
    findOne: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
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
  const mockNotifications = {
    findOne: jest.fn().mockResolvedValue(notificationsDto),
    find: jest.fn().mockResolvedValue([notificationsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(notificationsDto),
    findOneOrFail: jest.fn().mockResolvedValue(notificationsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockApprovalsEmployees = {
    findOne: jest.fn().mockResolvedValue(approvalsEmployeesDto),
    find: jest.fn().mockResolvedValue([approvalsEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(approvalsEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue(approvalsEmployeesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformation = {
    findOne: jest.fn().mockResolvedValue(jobInformationDto),
    find: jest.fn().mockResolvedValue([jobInformationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(jobInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobInformationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockNotificationData = {
    findOne: jest.fn().mockResolvedValue(notificationDataDto),
    find: jest.fn().mockResolvedValue([notificationDataDto]),
    create: jest.fn().mockResolvedValue(notificationDataDto),
    save: jest.fn().mockResolvedValue(notificationDataDto),
    findOneOrFail: jest.fn().mockResolvedValue(notificationDataDto),
    remove: jest.fn().mockResolvedValue({}),
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

  const mockAuthGuard = {};
  const mockTimeOffPolicies = {
    findOne: jest.fn().mockResolvedValue(mockTimeOffPoliciesDto),
  };

  beforeAll(async () => {
    //console.log('notificationsDto',notificationsDto)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmployee))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateTemporaryAddress))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePermanentAddress))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateFullName))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(EmployeementStatussesChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(EmployeementStatussesFormData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(EmployeementStatussesMainData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormDataReportTo))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(JobInfoUpdateChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(JobInfoUpdateMainData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(CompensationFormData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(CompensationChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(CompensationMainData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PromotionCompensationChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PromotionCompensationFormData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateChangedData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockNotificationData)
      .overrideProvider(
        getRepositoryToken(PromotionJobInfoUpdateFormDataReportTo),
      )
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PromotionMainData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(NoPayAlert))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(AnnouncementNotifications))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdatePhone))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PersonalInfoUpdateEmail))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(RemoveNoPay))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(AddNoPay))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PolicyChange))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(AssetsNotification))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(OnBoarding))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployees))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(OffBoarding))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(OffboardingTaskEmployees))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(SelfAssessment))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(ManagerAssessment))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(RequestFeedBack))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(GetFeedBack))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(PerformanceFeedBackEmployees))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(WellbeingNotification))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(WellbeingEmployees))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformation)
      .overrideProvider(getRepositoryToken(ApprovalsEmployees))
      .useValue(mockApprovalsEmployees)
      .overrideProvider(getRepositoryToken(Assets))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(assetRequestNotificationData))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(SatisfactionNotification))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(ReportTo))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(claims))
      .useValue(mockNotificationData)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(FullName))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PermanentAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TemporaryAddress))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Email))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Phone))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffInformation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffCategory))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(AccuralLevels))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffPolicies))
      .useValue(mockTimeOffPolicies)
      .overrideProvider(getRepositoryToken(Social))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(APIService)
      .useValue(mockAPIService)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/notifications (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/notifications')
      .send({
        data: {},
        type: 'assetRequest',
        hidden: false,
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/notifications (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/notifications')
      .set('userid', 'userId')
      .expect(200)
      .expect([notificationsDto]);
  });
  it(`/notifications/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/notifications/:id')
      .send({ hidden: true })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });

  it(`/requests/employee-satisfaction/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/requests/employee-satisfaction/:id')
      .send({ submit: false })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/requests/timeoff/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/requests/timeoff/:id')
      .send({
        type: 'timeoff',
        data: {
          employeeId: '',
          employeeName: '',
          dateFrom: '',
          dateTo: '',
          timeoffCategoryId: '',
          timeoffCategoryName: '',
          dates: '',
          total: '',
          note: '',
          fileId: '',
          nopay: false,
          nopayTotal: null,
          status: 'pending',
          coverupPersonId: '',
        },
        hidden: false,
      })
      .expect(200)
      .expect({ nopayError: false, exceedCount: 0 });
  });
  it(`/requests/claim-request/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/requests/claim-request/:id')
      .send({
        status: '',
        comment: '',
        action: '',
        paidBy: '',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/requests/asset-request/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/requests/asset-request/:id')
      .send({ status: 'approved' })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/personal-info-update/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/personal-info-update/:id')
      .send({ status: '' })
      .set('userid', 'userId')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/employee-status-update/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/employee-status-update/:id')
      .send({ status: 'approved' })
      .set('userid', 'userId')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/job-info-update/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/job-info-update/:id')
      .send({ status: 'approved' })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/promotion/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/promotion/:id')
      .send({ status: 'approved' })
      .set('userid', 'userId')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/no-pay-alert/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/no-pay-alert/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/assets/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/assets/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/holiday-alert/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/holiday-alert/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/announcement/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/announcement/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/on-boarding/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/on-boarding/:id')
      .send({
        data: {},
        onBoardingTaskEmployeeId: '',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/off-boarding/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/off-boarding/:id')
      .send({
        data: {},
        offBoardingTaskEmployeeId: '',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/request/employee-wellbeing/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/requests/employee-satisfaction/:id')
      .send({
        data: {},
        WellbeingEmployeesId: '',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });

  it(`/requests/timeoff/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/requests/timeoff/userId2')
      .expect(200)
      .expect([]);
  });
  it(`/:companyId/requests/timeoff (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/requests/timeoff')
      .send({
        type: 'timeoff',
        data: {
          employeeId: '',
          employeeName: '',
          dateFrom: '',
          dateTo: '',
          timeoffCategoryId: '',
          timeoffCategoryName: '',
          dates: '',
          total: '',
          note: '',
          fileId: '',
          nopay: false,
          nopayTotal: null,
          status: 'pending',
          coverupPersonId: '',
        },
        hidden: false,
      })
      .expect(200)
      .expect([{}]);
  });
  it(`/request/personal-info-update/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/personal-info-update/:id')
      .send({ status: '' })
      .set('userid', 'userId')
      .expect(200)
      .expect({});
  });
  it(`/request/employee-status-update/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/employee-status-update/:id')
      .send({ status: 'approved' })
      .set('userid', 'userId')
      .expect(200)
      .expect({});
  });
  it(`/request/job-info-update/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/job-info-update/:id')
      .send({ status: 'approved' })
      .expect(200)
      .expect({});
  });
  it(`/request/promotion/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/promotion/:id')
      .send({ status: 'approved' })
      .set('userid', 'userId')
      .expect(200)
      .expect({});
  });
  it(`/request/no-pay-alert/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/no-pay-alert/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({});
  });
  it(`/request/assets/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/assets/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({});
  });
  it(`/request/holiday-alert/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/holiday-alert/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({});
  });
  it(`/request/announcement/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/announcement/:id')
      .send({
        data: {},
        hidden: false,
      })
      .expect(200)
      .expect({});
  });
  it(`/request/on-boarding/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/on-boarding/:id')
      .send({
        data: {},
        onBoardingTaskEmployeeId: '',
      })
      .expect(200)
      .expect({});
  });
  it(`/request/off-boarding/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/off-boarding/:id')
      .send({
        data: {},
        offBoardingTaskEmployeeId: '',
      })
      .expect(200)
      .expect({});
  });
  it(`/request/employee-wellbeing/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/request/employee-wellbeing/:id')
      .send({
        data: {},
        WellbeingEmployeesId: '',
      })
      .expect(200)
      .expect({});
  });
});
