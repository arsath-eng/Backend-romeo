import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DivisionModule } from '../src/settingsEmployeeFeildsDivision/module/module';
import { Division } from '../src/settingsEmployeeFeildsDivision/entities/division.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsDivision (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockDivisionDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-03',
    modifiedAt: '2023-08-03',
    companyId: '1',
  };

  const mockDivisionRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockDivisionDto]),
    findOrFail: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformationRepository = {
    count: jest.fn().mockResolvedValue(1),
    find: jest.fn().mockResolvedValue({}),
  };
  const mockJobInfoUpdateFormDataRepository = {
    find: jest.fn().mockResolvedValue({}),
  };
  const mockPromotionJobInfoUpdateFormDataRepository = {
    save: jest.fn().mockResolvedValue({}),
  };
  const mockNotificationsRepository = {
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DivisionModule],
    })
      .overrideProvider(getRepositoryToken(Division))
      .useValue(mockDivisionRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockPromotionJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotificationsRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/division (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/division')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/division (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/division')
      .expect(200)
      .expect([mockDivisionDto]);
  });

  it('settings/employee-feilds/division/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/division/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/division/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/division/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
