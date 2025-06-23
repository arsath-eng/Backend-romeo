import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeOffPoliciesModule } from '../src/settingsTimeOffTimeOffPolicies/module/module';

import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmCommon } from '@flows/allEntities/common.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { AppModule } from '@flows/app.module';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
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

describe('SettingsTimeOffPolicies (e2e) ', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mockTimeOffPolicyDto = {
    categories: [],
  };
  const mockTimeOffPolicy = {
    id: 1,
    data: {
      categories: [],
      type: "",
      employementStatus: "",
      policyName: "",
      startDate: "",
      effectiveDate: "",
    }
  }
  const mockEmployeeStatusDto = {};
  const mockTimeOffInformationDto = {};
  const mockTimeOffCategoryDto = {};
  const mockTimeOffRequestNotificationDatesDto = {};
  const mockTimeOffRequestNotificationDataDto = {};
  const mockNotificationRequestDto = {};
  const mockAccuralLevelsDto = {};
  const mockPolicyChangeDto = {};
  const mockEmployeeDto = {};

  const mocktimeOffPoliciesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue(mockTimeOffPolicyDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeStatusRepository = {};
  const mockTimeOffInformationRepository = {};
  const mockTimeOffCategoryRepository = {};
  const mockTimeOffRequestNotificationDatesRepository = {};
  const mockTimeOffRequestNotificationDataRepository = {};
  const mockNotificationRequestRepository = {};
  const mockAccuralLevelsRepository = {};
  const mockPolicyChangeRepository = {};
  const mockEmployeeRepository = {};
  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};
  const mockCommonRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(mockTimeOffPolicy),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mock = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
    .useValue(mock)
    .overrideProvider(getRepositoryToken(HrmNotifications))
    .useValue(mock)
    .overrideProvider(getRepositoryToken(HrmCommon))
    .useValue(mockCommonRepository)
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

  it(':companyId/settings/timeoff/timeoff-policies (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/timeoff/timeoff-policies')
      .expect(200)
      .send(mockTimeOffPolicyDto)
      .expect({});
  });

  it(':companyId/settings/timeoff/timeoff-policies (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/timeoff/timeoff-policies')
      .expect(200)
      .expect([]);
  });

  it('settings/timeoff/timeoff-policies/:ids (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/timeoff/timeoff-policies/1')
      .expect(200)
      .send(mockTimeOffPolicyDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
  
  it('settings/timeoff/timeoff-policies/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/timeoff/timeoff-policies/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
