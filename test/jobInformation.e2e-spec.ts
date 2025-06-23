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
import { JobInformationModule } from '../src/jobInformation/module/jobInformation.module';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { ApprovalsAll } from '../src/settingsApprovals/entities/approvalsAll.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { TimezoneService } from '../src/timezone/timezone.service';
describe('JobInformationController (e2e)', () => {
  let app: INestApplication;
  let reportToDto = {
    id: '',
    employeeId: '',
    reporterId: '',
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
    access: {},
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
    assetApproval: '',
    claimRequest: '',
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
  const mockJobInformation = {
    findOne: jest.fn().mockResolvedValue(jobInformationDto),
    find: jest.fn().mockResolvedValue([jobInformationDto]),
    create: jest.fn().mockResolvedValue(jobInformationDto),
    save: jest.fn().mockResolvedValue(jobInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobInformationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockReportTo = {
    findOne: jest.fn().mockResolvedValue(reportToDto),
    find: jest.fn().mockResolvedValue([reportToDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(reportToDto),
    findOneOrFail: jest.fn().mockResolvedValue(reportToDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAccessLevelsEmployees = {
    findOne: jest.fn().mockResolvedValue(accessLevelsEmployeesDto),
    find: jest.fn().mockResolvedValue([accessLevelsEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(accessLevelsEmployeesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAccessLevels = {
    findOne: jest.fn().mockResolvedValue(accessLevelsDto),
    find: jest.fn().mockResolvedValue([accessLevelsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(accessLevelsDto),
    findOneOrFail: jest.fn().mockResolvedValue(accessLevelsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockApprovalsAll = {
    findOne: jest.fn().mockResolvedValue(approvalsAllDto),
    find: jest.fn().mockResolvedValue([approvalsAllDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(approvalsAllDto),
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
  const mockS3Service = {
    uploadDocument: jest.fn().mockResolvedValue({ Location: '' }),
  };
  const mockAuthGuard = {};
  const mockTimeTrackingService = {
    activityTrackingFunction: jest.fn().mockResolvedValue({}),
  };
  const mockTimezoneService = {
    dateMatches: jest.fn().mockResolvedValue(true),
  };
  const mock = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JobInformationModule],
    })
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformation)
      .overrideProvider(getRepositoryToken(ReportTo))
      .useValue(mockReportTo)
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mockAccessLevelsEmployees)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mockAccessLevels)
      .overrideProvider(getRepositoryToken(ApprovalsAll))
      .useValue(mockApprovalsAll)
      .overrideProvider(getRepositoryToken(ApprovalsEmployees))
      .useValue(mockApprovalsEmployees)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(TimeTrackingService)
      .useValue(mockTimeTrackingService)
      .overrideProvider(TimezoneService)
      .useValue(mockTimezoneService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/job-info (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/job-info')
      .send(jobInformationDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/job-info (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/job-info')
      .expect(200)
      .expect([jobInformationDto]);
  });
  it(`/job-info/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/job-info/:id')
      .expect(200)
      .expect([jobInformationDto]);
  });
  it(`/job-info/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/job-info/:id')
      .send(jobInformationDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/job-info/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/job-info/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
