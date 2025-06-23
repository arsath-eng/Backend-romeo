import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobTitlesModule } from '../src/settingsEmployeeFeildsJobTitles/module/module';
import { JobTitles } from '../src/settingsEmployeeFeildsJobTitles/entities/jobTitles.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsJobTitles (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockJobTitleDto = {
    id: '1',
    name: '',
    eeoCategory: '',
    createdAt: '2023-08-04',
    modifiedAt: '2023-08-04',
    companyId: '1',
  };

  const mockJobTitlesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockJobTitleDto]),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformationRepository = {
    count: jest.fn().mockReturnValue(0),
    find: jest.fn().mockReturnValue([]),
  };
  const mockJobInfoUpdateFormDataRepository = {
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([]),
  };
  const mockPromotionJobInfoUpdateFormDataRepository = {
    find: jest.fn().mockReturnValue([]),
    save: jest.fn().mockReturnValue({}),
  };
  const mockNotificationRequestRepository = {
    findOne: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JobTitlesModule],
    })
      .overrideProvider(getRepositoryToken(JobTitles))
      .useValue(mockJobTitlesRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockPromotionJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/job-titles (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/job-titles')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/job-titles (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/job-titles')
      .expect(200)
      .expect([{
        count: 0,
        ...mockJobTitleDto,
      }]);
  });

  it('settings/employee-feilds/job-titles/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/job-titles/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/job-titles/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/job-titles/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
