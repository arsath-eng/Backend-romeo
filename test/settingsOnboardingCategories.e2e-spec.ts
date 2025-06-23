import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OnboardingCategoriesModule } from '../src/settingsOnboardingCategories/module/module';
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
import { AppModule } from '@flows/app.module';
describe('settingsOnboardingCategories (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockOnboardingCategoriesDto = {
    id: '1',
    name: 'test',
    categoryId: '1',
    createdAt: '2023-08-1',
    modifiedAt: '2023-08-1',
    companyId: '1',
  };
  const mockOnboardingCategory = {
    type:'onboardingCategories',
    id: '1',
    data: {
      name: 'test',
      companyId: '1',
      categoryId: '1',
    },
    createdAt: '2023-08-1', 
    modifiedAt: '2023-08-1',
  }
  const mockOnboardingCategoriesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue({}),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockOnboardingTaskRepository = {
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockOnboardingTaskEmployeesRepository = {
    find: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};
  const mock = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue({}),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  }
  const mockCommon = {
    create: jest.fn().mockReturnValue(mockOnboardingCategory),
    save: jest.fn().mockReturnValue(mockOnboardingCategory),
    find: jest.fn().mockReturnValue([mockOnboardingCategory]),
    findOneOrFail: jest.fn().mockReturnValue(mockOnboardingCategory),
    remove: jest.fn().mockReturnValue(mockOnboardingCategory),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it(':companyId/settings/onboarding/categories (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/onboarding/categories')
      .expect(200)
      .expect(mockOnboardingCategory);
  });

  it(':companyId/settings/onboarding/categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/onboarding/categories')
      .expect(200)
      .expect([mockOnboardingCategoriesDto]);
  });

  it('settings/onboarding/categories/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/onboarding/categories/1')
      .expect(200)
      .expect(mockOnboardingCategory);
  });

  it('settings/onboarding/categories/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/onboarding/categories/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
