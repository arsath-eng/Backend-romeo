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
import { OffboardingTaskModule } from '../src/settingsOffboardingTask/module/module';
import { OffBoarding } from '../src/notifications/entities/offBoarding.entity';
import { OffboardingTaskEmployees } from '../src/offBoarding/entities/offboardingTaskEmployees.entity';
import { OffboardingTask } from '../src/settingsOffboardingTask/entities/offboardingTask.entity';
import { OffboardingTaskEmployeesModule } from '../src/offBoarding/module/module';
import { OfferLetterModule } from '../src/offer-letter/module/offer-letter.module';
import { JobApplication } from '../src/jobOpenings/entities/jobApplication.entity';
import { offerLetter } from '../src/offer-letter/entities/offerLetter.entity';
import { offerLetterUpload } from '../src/offer-letter/entities/offerLetterUpload.entity';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
import { EmailsNewService } from '../src/ses/service/emails.service';
describe('OffBoardingController (e2e)', () => {
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
  let offerLetterUploadDto = {
    id: '',
    name: '',
    fileLink: '',
    format: '',
    createdAt: '',
    modifiedAt: '',
  };
  let jobApplicationDto = {
    id: '',
    jobOpeningId: '',
    jobOpeningTitle: '',
    firstName: '',
    archived: false,
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    other: false,
    applicant: false,
    gender: '',
    ethnicity: '',
    disability: '',
    veterianStatus: '',
    rating: '',
    offer: false,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    status: {
      id: '',
      name: '',
      comment: '',
    },
  };
  let offerLetterDto = {
    id: '',
    candidateId: '',
    email: '',
    candidateInfo: {},
    data: {},
    files: [],
    uploadedFile: '',
    expiredDate: '',
    job: {},
    compensation: {},
    whoContact: {
      name: '',
      email: 'abc@example.com',
    },
    sentBy: {},
    companyId: '',
    seen: false,
    submit: false,
    createdAt: '',
    modifiedAt: '',
  };
  let offboardingTaskEmployeesDto = {
    id: '',
    employeeId: '',
    preDefined: false,
    taskId: '',
    form: {},
    completed: false,
    completedBy: '',
    completedDate: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let offBoardingDto = {
    id: '',
    offBoardingTaskEmployeeId: '',
    createdAt: '',
    modifiedAt: '',
  };
  let offBoardingTaskDto = {
    id: '',
    name: '',
    categoryId: '',
    description: '',
    assignTo: '',
    dueDate: {},
    sendNotification: '',
    attachFiles: [],
    allEmployees: '',
    eligible: [],
    createdAt: '',
    modifiedAt: '',
    companyId: '',
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
  const goalsDto = {
    id: '',
    employeeId: '',
    objective: '',
    dueDate: '',
    shortDesc: '',
    attachFiles: [],
    closeGoal: {},
    shareWith: [],
    pogress: {},
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  const goalsCommentsDto = {
    id: '',
    goalId: '',
    comment: '',
    commenterId: '',
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
  const mockEmailsNewService = {
    sendUserConfirmation: jest.fn().mockResolvedValue({}),
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
  const mockOfferletter = {
    findOne: jest.fn().mockResolvedValue(offerLetterDto),
    find: jest.fn().mockResolvedValue([offerLetterDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(offerLetterDto),
    findOneOrFail: jest.fn().mockResolvedValue(offerLetterDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobApplication = {
    findOne: jest.fn().mockResolvedValue(jobApplicationDto),
    find: jest.fn().mockResolvedValue([jobApplicationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(jobApplicationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobApplicationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOfferLetterUpload = {
    findOne: jest.fn().mockResolvedValue({
      fileLink: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
      id: '',
      name: '',
      format: '',
      createdAt: '',
      modifiedAt: '',
    }),
    find: jest.fn().mockResolvedValue([offerLetterUploadDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(offerLetterUploadDto),
    findOneOrFail: jest.fn().mockResolvedValue(offerLetterUploadDto),
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

  const mockFile = {
    buffer: Buffer.from('mocked-file-content'),
    mimetype: 'image/jpeg',
    originalname: 'file.jpg',
  };

  const mocks3Service = {
    uploadDocument: jest.fn().mockResolvedValue({
      fileLink: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
    }),
  };
  const mockAuthGuard = {};
  const mock = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OfferLetterModule],
    })
      .overrideProvider(getRepositoryToken(offerLetter))
      .useValue(mockOfferletter)
      .overrideProvider(getRepositoryToken(JobApplication))
      .useValue(mockJobApplication)
      .overrideProvider(getRepositoryToken(offerLetterUpload))
      .useValue(mockOfferLetterUpload)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(APIService)
      .useValue(mockAPIService)
      .overrideProvider(S3Service)
      .useValue(mocks3Service)
      .overrideProvider(EmailsNewService)
      .useValue(mockEmailsNewService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/offer-letter-docs/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/offer-letter-docs/:id')
      .expect(200)
      .expect(offerLetterUploadDto);
  });
  it(`/offer-letter/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/offer-letter/:id')
      .expect(200)
      .expect(offerLetterDto);
  });
  it(`/candidate-offer-letter/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/candidate-offer-letter/:id')
      .expect(200)
      .expect(offerLetterDto);
  });
  it(`/offer-letter (POST)`, () => {
    return request(app.getHttpServer())
      .post('/offer-letter')
      .send(offerLetterDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/offer-letter/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/offer-letter/:id')
      .send(offerLetterDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/revise-offer-letter/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/revise-offer-letter/:id')
      .send(offerLetterDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/offer-letter/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/offer-letter/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/offer-letter/upload (POST)`, () => {
    return request(app.getHttpServer())
      .post('/offer-letter/upload')
      .attach('files', mockFile.buffer, mockFile.originalname)
      .expect(200)
      .expect('');
  });
});
