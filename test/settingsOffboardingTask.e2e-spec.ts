import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OffboardingTaskModule } from '../src/settingsOffboardingTask/module/module';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
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

describe('settingsOffboardingTask (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockOffboardingTaskDto = {
    id: '1',
    data: {
      name: '',
      categoryId: '',
      dueDate: {},
      eligible: [],
      createAt: '2023-08-02',
      modifiedAt: '2023-08-02',
    },
    createAt: '2023-08-02',
    modifiedAt: '2023-08-02',
    companyId: '1',
  };

  const mockOffboardingTask = {
    id: '1',
    name: '',
    categoryId: '',
    dueDate: {},
    eligible: [],
    companyId: '1',
    createAt: '2023-08-02',
    modifiedAt: '2023-08-02',
  }

  const mockOffboardingTaskRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue(mockOffboardingTaskDto),
    find: jest.fn().mockReturnValue([mockOffboardingTaskDto]),
    findOne: jest.fn().mockReturnValue(mockOffboardingTaskDto),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockOffboardingTaskEmployeesRepository = {
    remove: jest.fn().mockReturnValue({}),
  };
  const mock = {}
  const mockEmployeeRepository = {};
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OffboardingTaskModule],
    })
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmConfigs))
      .useValue(mockOffboardingTaskRepository)
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

  it(':companyId/settings/offboarding/task (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/offboarding/task')
      .expect(200)
      .expect(mockOffboardingTaskDto);
  });

  it(':companyId/settings/offboarding/task (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/offboarding/task')
      .expect(200)
      .expect([mockOffboardingTask]);
  });

  it('settings/offboarding/task/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/offboarding/task/1')
      .expect(200)
      .expect(mockOffboardingTask);
  });

  it('settings/offboarding/task/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/offboarding/task/1')
      .expect(200)
      .expect(mockOffboardingTaskDto);
  });

  it('ettings/offboarding/task/delete/:id (POST)', () => {
    return request(app.getHttpServer())
      .post('/settings/offboarding/task/delete/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
