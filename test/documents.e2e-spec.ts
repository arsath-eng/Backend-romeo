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
import { DocumentsModule } from '../src/documents/module/documents.module';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import * as path from 'path';
import * as fs from 'fs';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
const globalPrefix = 'app/v1';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let companyDto = {
    id: "",
    companyName: "",
    stripeCustomerId: "",
    initialEmail: "",
    paymentLink: "",
    noEmp: "",
    country: "",
    heroLogoURL: "",
    logoURL: "",
    paidStatus: "",
    status: "",
    features: [],
    addonFeatures: [],
    theme: "",
    trialActive: true,
    demoData: true,
    createdAt: "",
    modifiedAt: "",
    waitingPeriod: true,
    timezone: "Asia/Colombo",
    waitingPeriodStartDate: "",
    addonStatus: true,
    employeeAddStatus: true,
    currency: "",
  }
  let superAdminEmailCountDto = {
    id: "",
    companyId: "",
    count: 1,
    type: "",
    createdAt: "",
    modifiedAt: "",
  }
  let sapPackagesDto = {
    id: "",
    name: "",
    defaultUserCount: "",
    costMethod: "",
    productId: "",
    discount: "",
    discountInYearly: true,
    features: [],
    createdAt: "",
    modifiedAt: "",
  }
  let sapCompanyFeatures = {
    id: "",
    effectiveDate: "",
    companyId: "",
    defaultUserCount: "",
    packageId: "",
    expiredDate: "",
    billingPeriod: "",
    status: "",
    features: [],
    cost: "",
    comment: "",
    discount: "",
    stripeSubscriptionId: "",
    type: "",
    emails: [],
    customPackage: true,
    createdAt: "",
    modifiedAt: "",
  }
  let sapConfigFeaturesDto = {
    id: "",
    name: "",
    count: 1,
    countableItem: "",
    slug: "",
    category: "",
    status: "",
    description: "",
    createdAt: "",
    modifiedAt: "",
  }
  let foldersDto = {
    id: "",
    folderName: "",
    folderType: "",
    description: "",
    icon: "",
    subFolder: "",
    path:[],
    parentFolder: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let mock = {
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  let activityTrackingDto = {}
  let timeTrackingNotificationDataDto = {}
  let jobInformationDto = {}
  let timeTrackingProjectsDto = {}
  let timeTrackingEmployeeDataDto = {}
  let notificationsDto = {}
  let documentsDto = {
    id: "",
    folderId: "",
    employeeId: "",
    fileName: "",
    uploaderId: "",
    share: true,
    fileLink: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/check`,
    format: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let timeTrackingApprovalDto = {}
  let timeTrackingEmployeeDto = {}
  let timeTrackingDto = {}
  let CompensationDto = {}
  let PaySchedulesDto = {}
  let getDocumentsCountDto = {
    folderId:"",
    itemCount:2,
    sharedItemCount:2,
    filesCount:1,
    employessCount:1
  }
  let getAccessLevelsDocumentsDto = {
    employeeId:":id",
    showDocuments: true,
    folderIdList:[ "" ],
    fileIdList:[ "" ]
  }
  let employeeDto = { 
    fullName: {
      first:"",
      last:""
    },
    employeeId: '',
    timezone: '',
    username: '',
    password: '',
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
    hireDate: '',
    terminationDate: '',
    ethnicity: '',
    eeoCategory: '',
    shirtSize: '',
    allergies: '',
    dietaryRestric: '',
    secondaryLang: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    preferedName: '',
    online: false,
    profileImage: '',
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    findOneOrFail:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockFolders = {
    findOne:jest.fn().mockResolvedValue(foldersDto),
    findOneOrFail:jest.fn().mockResolvedValue(foldersDto),
    find:jest.fn().mockResolvedValue([foldersDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
    count:jest.fn().mockResolvedValue(1),
  }
  const mockDocuments = {
    findOne:jest.fn().mockResolvedValue(documentsDto),
    findOneOrFail:jest.fn().mockResolvedValue(documentsDto),
    find:jest.fn().mockResolvedValue([documentsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockNotifications = {
    findOne:jest.fn().mockResolvedValue(notificationsDto),
    findOneOrFail:jest.fn().mockResolvedValue(notificationsDto),
    find:jest.fn().mockResolvedValue([notificationsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  // const mocktimeTrackingApproval = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingApprovalDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingApprovalDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockActivityTracking = {
  //   findOne:jest.fn().mockResolvedValue(activityTrackingDto),
  //   find:jest.fn().mockResolvedValue([activityTrackingDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockTimeTrackingNotificationData = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingNotificationDataDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingNotificationDataDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockTimeTracking = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockTimeTrackingEmployee = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingEmployeeDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingEmployeeDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockTimeTrackingEmployeeData = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingEmployeeDataDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingEmployeeDataDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockTimeTrackingProjects = {
  //   findOne:jest.fn().mockResolvedValue(timeTrackingProjectsDto),
  //   find:jest.fn().mockResolvedValue([timeTrackingProjectsDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockJobInformation = {
  //   findOne:jest.fn().mockResolvedValue(jobInformationDto),
  //   find:jest.fn().mockResolvedValue([jobInformationDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockCompensation = {
  //   findOne:jest.fn().mockResolvedValue(CompensationDto),
  //   find:jest.fn().mockResolvedValue([CompensationDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  // const mockPaySchedules = {
  //   findOne:jest.fn().mockResolvedValue(PaySchedulesDto),
  //   find:jest.fn().mockResolvedValue([PaySchedulesDto]),
  //   create:jest.fn().mockResolvedValue({}),
  //   save:jest.fn().mockResolvedValue({}),
  // }
  const mockAPIService = {
    getCompanyById:jest.fn().mockResolvedValue(companyDto),
    getSuperAdminEmailCount:jest.fn().mockResolvedValue(superAdminEmailCountDto),
    postSuperAdminEmailCount:jest.fn().mockResolvedValue(superAdminEmailCountDto),
    updateStripeCustomerEmail:jest.fn().mockResolvedValue({statusCode: 200,description: 'success',}),
    getAllCompanies:jest.fn().mockResolvedValue([companyDto]),
    getSuperAdminConfigFeatureById:jest.fn().mockResolvedValue(sapConfigFeaturesDto),
    getActiveSuperAdminCompanyFeatures:jest.fn().mockResolvedValue(sapCompanyFeatures),
    addStripeCustomer:jest.fn().mockResolvedValue({id:""}),
    getSuperAdminPackagesEnterprise:jest.fn().mockResolvedValue(sapPackagesDto),
    postCompany:jest.fn().mockResolvedValue({id:""}),
    postSuperAdminCompanyFeatures:jest.fn().mockResolvedValue({}),
    getTestCompanyByEmail:jest.fn().mockResolvedValue({
      id: "",
      email: "",
      createdAt: "",
      modifiedAt: "",
    }),
    postCoupons:jest.fn().mockResolvedValue({}),
    postCouponsEmailSend:jest.fn().mockResolvedValue({}),
    getSuperAdminPackagesById:jest.fn().mockResolvedValue(sapPackagesDto),
    addTrialSubscription:jest.fn().mockResolvedValue({id:""}),
    getCompanyByName:jest.fn().mockResolvedValue(companyDto),
    getActivePackageSuperAdminCompanyFeatures:jest.fn().mockResolvedValue(sapCompanyFeatures),
    getActiveAddonSuperAdminCompanyFeatures:jest.fn().mockResolvedValue(sapCompanyFeatures),
    deleteCompanyById:jest.fn().mockResolvedValue({}),
    deleteCompanyUnsubscribeByCompanyId:jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyEmail:jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyFeatures:jest.fn().mockResolvedValue({}),
    deleteSuperAdminCompanyRefund:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DocumentsModule,],
    })
      .overrideProvider(getRepositoryToken(Folders)).useValue(mockFolders)
      .overrideProvider(getRepositoryToken(Documents)).useValue(mockDocuments)
      .overrideProvider(getRepositoryToken(Notifications)).useValue(mockNotifications)
      // .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      // .overrideProvider(getRepositoryToken(timeTrackingApproval)).useValue(mocktimeTrackingApproval)
      // .overrideProvider(getRepositoryToken(activityTracking)).useValue(mockActivityTracking)
      // .overrideProvider(getRepositoryToken(timeTrackingNotificationData)).useValue(mockTimeTrackingNotificationData)
      // .overrideProvider(getRepositoryToken(timeTracking)).useValue(mockTimeTracking)
      // .overrideProvider(getRepositoryToken(timeTrackingEmployee)).useValue(mockTimeTrackingEmployee)
      // .overrideProvider(getRepositoryToken(timeTrackingEmployeeData)).useValue(mockTimeTrackingEmployeeData)
      // .overrideProvider(getRepositoryToken(timeTrackingProjects)).useValue(mockTimeTrackingProjects)
      // .overrideProvider(getRepositoryToken(JobInformation)).useValue(mockJobInformation)
      // .overrideProvider(getRepositoryToken(Compensation)).useValue(mockCompensation)
      // .overrideProvider(getRepositoryToken(PaySchedules)).useValue(mockPaySchedules)
      .overrideProvider(getRepositoryToken(timeTrackingApproval)).useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData)).useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday)).useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeeStatus)).useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert)).useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates)).useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects)).useValue(mock)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(JobInformation)).useValue(mock)
      .overrideProvider(getRepositoryToken(Compensation)).useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules)).useValue(mock)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .overrideProvider(APIService).useValue(mockAPIService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/folders (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/folders')
      .send(foldersDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/folders (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/folders')
      .expect(200)
      .expect([foldersDto])
  });
  it(`/folders/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/folders/:id')
      .send(foldersDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/folders/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/folders/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/documents (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/documents')
      .send({
        files: [],
        id: "",
        folderId: "",
        employeeId: "",
        fileName: "",
        uploaderId: "",
        share: true,
        fileLink: "",
        format: "",
        createdAt: "",
        modifiedAt: "",
        companyId: "",
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/upload-documents (POST)`, () => {
    // const files = [
    //   path.resolve(__dirname, 'uploadFiles', 'end.png'),
    //   path.resolve(__dirname, 'uploadFiles', 'end1.png'),
    // ];

    return request(app.getHttpServer())
      .post('/:companyId/upload-documents')
      // .attach('files', files[0])
      // .attach('files', files[1])
      .attach('files', Buffer.from('Test file content'), {
        filename: 'end.png',
        contentType: 'Image/png',
      })
      .expect(201)
  });
  it(`/documents/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/documents/:id')
      .expect(200)
      .expect([documentsDto])
  });
  it(`/documents/single/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/documents/single/:id')
      .expect(200)
      .expect([documentsDto])
  });
  it(`/:companyId/documents (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/documents')
      .expect(200)
      .expect([documentsDto])
  });
  it(`/documents-single/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/documents-single/:id')
      .expect(200)
      .expect(documentsDto)
  });
  it(`/documents/count/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/documents/count/:id')
      .expect(200)
      .expect([getDocumentsCountDto])
  });
  it(`/access-levels/documents/employee/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/access-levels/documents/employee/:id')
      .expect(200)
      .expect(getAccessLevelsDocumentsDto)
  });
  it(`/documents/folders/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/documents/folders/:id')
      .expect(200)
      .expect([documentsDto])
  });
  it(`/documents/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/documents/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/documents/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/documents/:id')
      .send(documentsDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/delete/documents (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/delete/documents')
      .send({
        documentIdList:[],
        folderId: ''
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/move/documents (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/move/documents')
      .send({
        documentIdList:[],
        folderId: ''
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
