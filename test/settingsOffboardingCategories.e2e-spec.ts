import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OffboardingCategoriesModule } from '../src/settingsOffboardingCategories/module/module';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmCommon } from '@flows/allEntities/common.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
describe('SettingsOffboardingCategories (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mockOffboardingCategories = {
    id: '1',
    data: {
      name: '',
      createdAt: '2023-08-3',
      modifiedAt: '2023-08-3',
    },
    name: '',
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
  };

  const mockOffboardingCategoriesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue(mockOffboardingCategories),
    find: jest.fn().mockReturnValue([mockOffboardingCategories]),
    findOneOrFail: jest.fn().mockReturnValue(mockOffboardingCategories),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockOffboardingTaskRepository = {
    remove: jest.fn().mockReturnValue({}),
    findOneOrFail: jest.fn().mockReturnValue({}),
  };
  const mockOffboardingTaskEmployeesRepository = {
    remove: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};
  const mock = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OffboardingCategoriesModule],
    })
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmCommon))
      .useValue(mockOffboardingCategoriesRepository)
      .overrideProvider(getRepositoryToken(HrmAnnouncements))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmActivityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAssetsClaims))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAttendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmBoardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmCustomerSupport))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmFiles))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmFolders))
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

  it(':companyId/settings/offboarding/categories (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/offboarding/categories')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/offboarding/categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/offboarding/categories')
      .expect(200)
      .expect([mockOffboardingCategories]);
  });

  it('settings/offboarding/categories/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/offboarding/categories/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/offboarding/categories/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/offboarding/categories/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
