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
import { EmployeeStatusModule } from '../src/employeeStatus/module/employeeStatus.module';
import { TimezoneService } from '../src/timezone/timezone.service';
import { TimeTrackingService } from '../src/time-tracking/service/time-tracking.service';
import { AccuralLevels } from '../src/accuralLevels/entities/accuralLevels.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { OffBoarding } from '../src/notifications/entities/offBoarding.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { TimeOffPolicies } from '../src/settingsTimeOffTimeOffPolicies/entities/TimeOffPolicies.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { EmployeeStatusDto } from '../src/employeeStatus/dto/employeeStatus.dto'
import { FullName } from '../src/employee/entities/fullname.entity';
jest.mock('fs');
describe('EmployeeStatusController (e2e)', () => {
  let app: INestApplication;
  const employeeStatusDto = {
    employeeId: "",
    effectiveDate: "",
    status: "",
    comment: "",
    active: false,
    createdAt: "",
    modifiedAt: "",
  }
  let fullNameDto = {
    id: "",
    first: "",
    middle: "",
    last: "",
  }
  let accuralLevelsDto = {
    id: "",
    employeeId: "",
    employeeName: "",
    companyId: "",
    date: "",
    policyId: "",
    activated: true,
    createdAt: "",
    modifiedAt: "",
  }
  let timeOffInformationDto = {
    id: "",
    employeeId: "",
    categoryId: "",
    totalDays: 1.0,
    usedDays: 1.0,
    categoryName: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let timeOffPoliciesDto = {
    id: "",
    policyName: "",
    type: "",
    employementStatus: "",
    startDate: 1,
    effectiveDate: "",
    categories: {},
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let timeOffCategoryDto = {
    id: "",
    timeoffNo: 1,
    name: "",
    units: "",
    icon: "",
    type: "",
    fileUpload: true,
    fileRequiredLimit: 1,
    noPay: true,
    coverupPerson: true,
    color: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let offBoardingDto = {
    id: "",
    offBoardingTaskEmployeeId:"",
    createdAt: "",
    modifiedAt: "",
  }
  let employeeDto = { 
    permanentAddress: {
      id: ""
    },
    phone: {
      work:123
    },
    email: {
      work: ""
    },
    fullName: {
      first:"",
      last:""
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
    createdAt: "",
    modifiedAt: "",
    preferedName: '',
    online: false,
    profileImage: '',
  }
  let companyLogoFoldersDto = {
    id: "",
    folderName: "",
    folderType: "",
    description: "",
    icon: "",
    subFolder: true,
    path: [],
    parentFolder: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  const mockEmployeeStatus = {
    findOne:jest.fn().mockResolvedValue(employeeStatusDto),
    find:jest.fn().mockResolvedValue([employeeStatusDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(employeeStatusDto),
    findOneOrFail:jest.fn().mockResolvedValue(employeeStatusDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    createQueryBuilder: jest.fn(() => ({
      delete:jest.fn(() => ({
        where:jest.fn(() => ({
          execute:jest.fn().mockResolvedValue({})
        })),
      })),
    })),
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(employeeDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockFullName = {
    findOne:jest.fn().mockResolvedValue(fullNameDto),
    find:jest.fn().mockResolvedValue([fullNameDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(fullNameDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockAccuralLevels = {
    findOne:jest.fn().mockResolvedValue(accuralLevelsDto),
    find:jest.fn().mockResolvedValue([accuralLevelsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(accuralLevelsDto),
    findOneOrFail:jest.fn().mockResolvedValue(accuralLevelsDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockTimeOffInformation = {
    findOne:jest.fn().mockResolvedValue(timeOffInformationDto),
    find:jest.fn().mockResolvedValue([timeOffInformationDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(timeOffInformationDto),
    findOneOrFail:jest.fn().mockResolvedValue(timeOffInformationDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockTimeOffPolicies = {
    findOne:jest.fn().mockResolvedValue(timeOffPoliciesDto),
    find:jest.fn().mockResolvedValue([timeOffPoliciesDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(timeOffPoliciesDto),
    findOneOrFail:jest.fn().mockResolvedValue(timeOffPoliciesDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockTimeOffCategory = {
    findOne:jest.fn().mockResolvedValue(timeOffCategoryDto),
    find:jest.fn().mockResolvedValue([timeOffCategoryDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(timeOffCategoryDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockOffBoarding = {
    findOne:jest.fn().mockResolvedValue(offBoardingDto),
    find:jest.fn().mockResolvedValue([offBoardingDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(offBoardingDto),
    findOneOrFail:jest.fn().mockResolvedValue(offBoardingDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockTimeTrackingService = {
    activityTrackingFunction:jest.fn().mockResolvedValue({}),
  }
  const mockTimezoneService = {
    dateMatches:jest.fn().mockResolvedValue(true),
  }
  const mockAuthGuard = {}
  const mock = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmployeeStatusModule],
    })
      .overrideProvider(getRepositoryToken(FullName)).useValue(mockFullName)
      .overrideProvider(getRepositoryToken(EmployeeStatus)).useValue(mockEmployeeStatus)
      .overrideProvider(getRepositoryToken(AccuralLevels)).useValue(mockAccuralLevels)
      .overrideProvider(getRepositoryToken(TimeOffInformation)).useValue(mockTimeOffInformation)
      .overrideProvider(getRepositoryToken(TimeOffPolicies)).useValue(mockTimeOffPolicies)
      .overrideProvider(getRepositoryToken(TimeOffCategory)).useValue(mockTimeOffCategory)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(OffBoarding)).useValue(mockOffBoarding)
      .overrideProvider(getRepositoryToken(timeTrackingApproval)).useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData)).useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday)).useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications)).useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert)).useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates)).useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee)).useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects)).useValue(mock)
      .overrideProvider(getRepositoryToken(JobInformation)).useValue(mock)
      .overrideProvider(getRepositoryToken(Compensation)).useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules)).useValue(mock)
      .overrideProvider(getRepositoryToken(Documents)).useValue(mock)
      .overrideProvider(getRepositoryToken(Folders)).useValue(mock)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .overrideProvider(TimezoneService).useValue(mockTimezoneService)
      .overrideProvider(TimeTrackingService).useValue(mockTimeTrackingService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/employement-statuses (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/employement-statuses')
      .send(employeeStatusDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/employement-statuses (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/employement-statuses')
      .expect(200)
      .expect([employeeStatusDto])
  });
  it(`/employement-statuses/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/employement-statuses/:id')
      .expect(200)
      .expect([employeeStatusDto])
  });
  it(`/employement-statuses/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/employement-statuses/:id')
      .send(employeeStatusDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/employement-statuses/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/employement-statuses/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
