import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendanceModule } from '../src/attendance/module/attendance.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { AttendanceService } from '../src/attendance/service/attendance.service';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { AppModule } from '@flows/app.module';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
const globalPrefix = 'app/v1';

describe('AttendanceController (e2e)', () => {
  let app: INestApplication;
  let employeeDto = { 
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
  let jobInformationDto = {
    id: '',
    employeeId: '',
    effectiveDate: new Date(),
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
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: '',
  }
  let attendanceDto = {
    id: '',
    employeeId: '',
    date: '',
    locationType: '',
    late: true,
    reduce: true,
    remoteLocation: '',
    start: true,
    startTime: '',
    active: true,
    end: true,
    endTime: '',
    companyId: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
  }

  const mockAttendance = {
    findOne:jest.fn().mockResolvedValue(attendanceDto),
    find:jest.fn().mockResolvedValue([attendanceDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockJobInformation = {
    findOne:jest.fn().mockResolvedValue(jobInformationDto),
    find:jest.fn().mockResolvedValue([jobInformationDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockAttendanceSettings = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([{date: new Date()}]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockReportTo = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([{date: new Date()}]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockNotifications = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([{date: new Date()}]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockDocuments = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([{date: new Date()}]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockFolders = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([{date: new Date()}]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockCommon = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  } 
  const mockAuthGuard = {}
  const mock = {
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(HrmAttendance))
      .useValue(mockAttendance)
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(HrmFolders))
      .useValue(mockFolders)
      .overrideProvider(getRepositoryToken(HrmConfigs))
      .useValue(mockCommon)
      .overrideProvider(getRepositoryToken(HrmAnnouncements))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmActivityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAssetsClaims))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmBoardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmCustomerSupport))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmFiles))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmNotes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmOfferLetter))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmPerformanceTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmReports))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmTalentPools))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmTrainingComplete))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmVerification))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(hrmHiring))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(hrmPayroll))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/settings/attendance/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/settings/attendance')
      .expect(200)
      .expect({})
  });
  it(`/settings/attendance/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/settings/attendance/:id')
      .expect(200)
  });
  it(`/attendance/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/attendance/:id')
      .expect(200)
  });
  it(`/attendance-today/my-circle/:employeeId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/attendance-today/my-circle/:employeeId')
      .expect(200)
  });
  it(`/attendance-today/:employeeId/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/attendance-today/:employeeId')
      .expect(200)
  });
  it(`/:companyId/attendance-today/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/attendance-today')
      .expect(200)
  });
  it(`/attendance/:employeeId/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/attendance/:employeeId')
      .expect(200)
  });
  it(`/:companyId/attendance-week/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/attendance-week')
      .expect(200)
  });
  it(`/:companyId/attendance/ (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/attendance')
      .expect(200)
  });
  it(`/attendance-check-in/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/attendance-check-in')
      .expect(200)
  });
  it(`/attendance-check-out/:id/ (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/attendance-check-out/:id')
      .expect(200)
  });
  it(`/attendance/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/attendance')
      .expect(200)
  });
});
