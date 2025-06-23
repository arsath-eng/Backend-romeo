import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginModule } from '../src/login/module/login.module';
import { recoverPassword } from '../src/login/entities/recoverPassword.entity';
import { emailVerification } from '../src/login/entities/emailVerification.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { AuthService } from '../src/auth/service/auth.service';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
import { LoginService } from '@flows/login/service/login.service';
import { EmailsNewService } from '../src/ses/service/emails.service';
import * as jwt from 'jsonwebtoken';

describe('Login (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockEmployeeDto = {
    employeeId: '1',
    timezone: 'test',
    username: 'test',
    password:
      '$argon2d$v=19$m=12,t=3,p=1$ZGYwZWV1ZXk1M3AwMDAwMA$+LiCXJh03z90lD1ee91R0g',
    getstarted: true,
    emailVerified: true,
    employeeNo: 1,
    access: true,
    status: '',
    birthday: '2023-04-07',
    gender: '',
    maritalStatus: '',
    passportNumber: '',
    textfileNumber: '',
    nin: '',
    vaccinated: true,
    doses: 1,
    reason: '',
    owner: true,
    fullName: {
      first: 'test',
      last: 'test',
    },
  };

  const mockRecoverRepository = {
    save: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
  };

  const mockEmailVerficationDto = {
    id: '1',
    username: 'test',
    token: 'test',
    employeeId: '1',
    canUse: true,
    createdAt: '2023-08-16',
    modifiedAt: '2023-08-16',
  };
  const mockEmailRepository = {
    findOne: jest.fn().mockResolvedValue(mockEmailVerficationDto),
    save: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {
    findOne: jest.fn().mockResolvedValue(mockEmployeeDto),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformationRepository = {
    findOne: jest.fn().mockResolvedValue({}),
  };
  const mockAccessLevelsEmployeesRepository = {
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};
  const mockNotificationRequestRepository = {};
  const mocktimeTrackingApprovalRepository = {};
  const mockactivityTrackingRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mocktimeTrackingNotificationDataRepository = {};
  const mocktimeTrackingRepository = {};
  const mocktimeTrackingEmployeeRepository = {};
  const mocktimeTrackingEmployeeDataRepository = {};
  const mocktimeTrackingProjectsRepository = {};
  const mockCompensationRepository = {};
  const mockPaySchedulesRepository = {};
  const mockHolidayRepository = {};
  const mockEmployeeStatusRepository = {};
  const mockHolidayAlertRepository = {};
  const mockTimeOffRequestNotificationDataRepository = {};
  const mockTimeOffRequestNotificationDatesRepository = {};
  const mockAuthServiceDto = { accessToken: 'test', refreshToken: 'test' };
  const mockAuthService = {
    login: jest.fn().mockResolvedValue(mockAuthServiceDto),
    logout: jest.fn().mockResolvedValue({}),
  };

  const mockAPIserviceDto = { id: '1', companyName: 'test', theme: 'test' };

  const mockApiService = {
    getCompanyById: jest.fn().mockResolvedValue(mockAPIserviceDto),
  };

  const mockmailService = {
    sendUserConfirmation: jest.fn().mockResolvedValue({}),
  };

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LoginModule],
    })
      .overrideProvider(getRepositoryToken(recoverPassword))
      .useValue(mockRecoverRepository)
      .overrideProvider(getRepositoryToken(emailVerification))
      .useValue(mockEmailRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mockAccessLevelsEmployeesRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mocktimeTrackingApprovalRepository)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mockactivityTrackingRepository)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mocktimeTrackingNotificationDataRepository)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mocktimeTrackingRepository)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mocktimeTrackingEmployeeRepository)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mocktimeTrackingEmployeeDataRepository)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mocktimeTrackingProjectsRepository)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mockCompensationRepository)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mockPaySchedulesRepository)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mockHolidayRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mockHolidayAlertRepository)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mockTimeOffRequestNotificationDataRepository)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mockTimeOffRequestNotificationDatesRepository)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(APIService)
      .useValue(mockApiService)
      .overrideProvider(EmailsNewService)
      .useValue(mockmailService)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const user = {
    username: 'test',
    password: 'test123',
  };

  it('login (POST)', () => {
    return request(app.getHttpServer())
      .post('/login')
      .send(user)
      .expect(201)
      .expect({
        employeeId: mockEmployeeDto.employeeId,
        employeeNo: mockEmployeeDto.employeeNo,
        employeeName:
          mockEmployeeDto.fullName.first + ' ' + mockEmployeeDto.fullName.last,
        success: true,
        username: true,
        emailVerified: true,
        hasAccess: true,
        token: mockAuthServiceDto.accessToken,
        theme: mockAPIserviceDto.theme,
        refreshToken: mockAuthServiceDto.refreshToken,
        companyId: mockAPIserviceDto.id,
        company: mockAPIserviceDto.companyName,
      });
  });

  it('/logout (POST)', () => {
    return request(app.getHttpServer()).post('/logout').expect(200).expect({});
  });

  // it('token-verify (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/token-verify')
  //     .send({
  //       token: 'test',
  //     })
  //     .expect(201)
  //     .expect({ validation: true });
  // });

  it('reset-password/:id (correct cardential)', () => {
    return request(app.getHttpServer())
      .post('/reset-password/1')
      .send({
        currentPassword: 'test123',
        newPassword: 'test2',
        accessToken: 'test',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });

  it('recover-password (POST)', () => {
    return request(app.getHttpServer())
      .post('/recover-password')
      .send({
        email: 'test',
      })
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('recover-password/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/recover-password/1')
      .send({
        password: 'test',
      })
      .expect(200)
      .expect({});
  });

  it('recover-password/new-link/:id (POST)', () => {
    return request(app.getHttpServer())
      .post('/recover-password/new-link/1')
      .expect(200)
      .expect({});
  });

  it('refresh-token (GET) ', () => {
    const employeeId = mockEmployeeDto.employeeId;
    const refreshToken = jwt.sign({ username: employeeId }, refreshTokenSecret);
    return request(app.getHttpServer())
      .get('/refresh-token')
      .send({ employeeId, refreshToken })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body).toHaveProperty('validation', true);
      });
  });

  it('email-verified/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/email-verified/1')
      .expect(200)
      .expect(mockEmailVerficationDto);
  });

  it('email-verified/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/email-verified/1')
      .send({ token: 'test' })
      .expect(200)
      .expect({});
  });

  it('email-verified/new-link/:employeeId (POST)', () => {
    return request(app.getHttpServer())
      .post('/email-verified/new-link/1')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
