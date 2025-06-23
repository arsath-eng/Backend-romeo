import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClaimsCategoryModule } from '../src/settingsEmployeeFeildsClaim/claimCategory.module';
import { claimsCategories } from '../src/settingsEmployeeFeildsClaim/claimsCategories.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';

describe('settingsEmployeeFeildsClaim (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockClaimsCategoriesDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockClaimsCategoriesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue(mockClaimsCategoriesDto),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformationRepository = {};
  const mockJobInfoUpdateFormDataRepository = {};
  const mockPromotionJobInfoUpdateFormDataRepository = {};
  const mockNotificationsRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ClaimsCategoryModule],
    })
      .overrideProvider(getRepositoryToken(claimsCategories))
      .useValue(mockClaimsCategoriesRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockPromotionJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotificationsRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/claim-category (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/claim-category')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/claim-category (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/claim-category')
      .expect(200)
      .expect(mockClaimsCategoriesDto);
  });

  it('settings/employee-feilds/claim-category/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/claim-category/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/claim-category/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/claim-category/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
