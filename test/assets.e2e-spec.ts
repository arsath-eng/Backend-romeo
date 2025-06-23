import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendanceModule } from '../src/attendance/module/attendance.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { AttendanceService } from '../src/attendance/service/attendance.service';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { AssetsModule } from '../src/assets/module/assets.module';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { AppModule } from '@flows/app.module';
const globalPrefix = 'app/v1';

describe('AssetsController (e2e)', () => {
  let app: INestApplication;
  let assetsDto = {
    id: '',
    employeeId: '',
    aseetsCategoryId: '',
    assetsDescription: '',
    serial: '',
    dateAssigned: '',
    dateReturned: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  }
  let employeeDto = {}
  const mockAssets = {
    findOne:jest.fn().mockResolvedValue(assetsDto),
    findOneOrFail:jest.fn().mockResolvedValue(assetsDto),
    find:jest.fn().mockResolvedValue([assetsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(assetsDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}

  const mock = {
    findOne:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue({}),
    find:jest.fn().mockResolvedValue([]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(HrmAttendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mock)
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

  it(`/:companyId/assets/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/assets')
      .expect(200)
      .expect({})
  });
  it(`/:companyId/assets (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/assets')
      .expect(200)
      .expect([])
  });
  it(`assets/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/assets/:id')
      .expect(200)
      .expect({})
  });
  it(`/assets/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/assets/:id')
      .expect(200)
      .expect(JSON.stringify({}))
  });
  it(`/assets/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/assets/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' })
  });
});
