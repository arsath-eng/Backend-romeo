import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OnboardingTaskModule } from '../src/settingsOnboardingTask/module/module';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { HrmCommon } from '@flows/allEntities/common.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
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


describe('SettingsOnboardingTask (e2e) ', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const onboardingTaskDto = {
    id: 1,
    name: '',
    dueDate: {},
    eligible: [],
    createdAt: '2023-08-2',
    modifiedAt: '2023-08-2',
  };

  const mockOnboardingTask = {
    id: 1,
    data: {
      name: '',
      dueDate: {},
      eligible: [],
    }
  }

  const mockOnboardingTaskRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([onboardingTaskDto]),
    findOne: jest.fn().mockResolvedValue(onboardingTaskDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOnboardingTaskEmployeesRepository = {
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const mockEmployeeStatusRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const mockJobInformationRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const mockCommon = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(mockOnboardingTask),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  }
  const mock = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OnboardingTaskModule],
    })
    .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
    .useValue(mock)
    .overrideProvider(getRepositoryToken(HrmNotifications))
    .useValue(mock)
    .overrideProvider(getRepositoryToken(HrmCommon))
    .useValue(mockCommon)
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

  it(':companyId/settings/onboarding/task (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/onboarding/task')
      .expect(200)
      .expect({});
  });

  it(':companyId/settings/onboarding/task (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/onboarding/task')
      .expect(200)
      .expect([]);
  });

  it('settings/onboarding/task/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/onboarding/task/1')
      .expect(200)
      .expect({
        id: mockOnboardingTask.id,
        ...mockOnboardingTask.data,
        eligibleList: [],
      });
  });

  it('settings/onboarding/task/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/onboarding/task/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/onboarding/task/delete/:id (POST)', () => {
    return request(app.getHttpServer())
      .post('/settings/onboarding/task/delete/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

});
