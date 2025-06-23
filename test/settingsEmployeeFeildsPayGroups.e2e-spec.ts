import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayGroupsModule } from '../src/settingsEmployeeFeildsPayGroups/module/module';
import { PayGroups } from '../src/settingsEmployeeFeildsPayGroups/entities/payGroups.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { CompensationFormData } from '../src/notifications/entities/compensationFormData.entity';
import { PromotionCompensationFormData } from '../src/notifications/entities/promotionCompensationFormData.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsPayGroups (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockPayGroupsDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-08',
    modifiedAt: '2023-08-08',
    companyId: '1',
  };

  const mockPayGroupsRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockPayGroupsDto]),
    findOneOrFail: jest.fn().mockReturnValue(mockPayGroupsDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockCompensationRepository = {
    count: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockCompensationFormDataRepository = {
    find: jest.fn().mockReturnValue({}),
  };
  const mockPromotionCompensationFormDataRepository = {};
  const mockNotificationRepository = {};
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PayGroupsModule],
    })
      .overrideProvider(getRepositoryToken(PayGroups))
      .useValue(mockPayGroupsRepository)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mockCompensationRepository)
      .overrideProvider(getRepositoryToken(CompensationFormData))
      .useValue(mockCompensationFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionCompensationFormData))
      .useValue(mockPromotionCompensationFormDataRepository)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotificationRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/pay-groups (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/pay-groups')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/pay-groups (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/pay-groups')
      .expect(200)
      .expect([mockPayGroupsDto]);
  });

  it('settings/employee-feilds/pay-groups/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/pay-groups/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/pay-groups/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/pay-groups/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
