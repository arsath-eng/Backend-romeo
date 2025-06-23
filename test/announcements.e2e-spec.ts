import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { AnnouncementsModule } from '../src/announcement/module/announcements.module';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { AppModule } from '@flows/app.module';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
const globalPrefix = 'app/v1';

describe('AnnouncementController (e2e)', () => {
  let app: INestApplication;
  let announcementDto = {
    id: '',
    title: '',
    email: {},
    attachFiles: [''],
    emailSend: true,
    emailAll: true,
    emailList: '',
    status: '',
    author: '',
    notificationId: '',
    createdAt: '',
    modifiedAt:  '',
    companyId: '',
  }
  let notificationsDto = {}
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


  const mockAnnouncement = {
    findOneOrFail:jest.fn().mockResolvedValue(announcementDto),
    findOne:jest.fn().mockResolvedValue(announcementDto),
    find:jest.fn().mockResolvedValue([announcementDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(announcementDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockNotifications = {
    findOne:jest.fn().mockResolvedValue(notificationsDto),
    find:jest.fn().mockResolvedValue([notificationsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mock = {
    findOneOrFail:jest.fn().mockResolvedValue({}),
    findOne:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue([]),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(HrmAttendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(HrmFolders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmConfigs))
      .useValue(mock)
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

  it(`/:companyId/announcement/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/announcement')
      .expect(200)
      .expect(announcementDto)
  })
  it(`/:companyId/announcement (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/announcement')
      .expect(200)
      .expect([announcementDto])
  });
  it(`/announcement/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/announcement/:id')
      .expect(200)
      .expect(announcementDto)
  });
  it(`/announcement/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/announcement/:id')
      .expect(200)
      .expect(announcementDto);
  });
  it(`/announcement/:id/ (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/announcement/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' })
  });
});
