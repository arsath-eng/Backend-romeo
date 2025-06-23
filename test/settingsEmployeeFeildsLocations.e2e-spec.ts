import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationsModule } from '../src/settingsEmployeeFeildsLocations/module/module';
import { Locations } from '../src/settingsEmployeeFeildsLocations/entities/locations.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsLocations (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockLocationsDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-07',
    modifiedAt: '2023-08-07',
  };

  const mockLocationsRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockLocationsDto]),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformationRepository = {
    count: jest.fn().mockReturnValue(0),
    find: jest.fn().mockReturnValue([]),
    save: jest.fn().mockReturnValue({}),
  };
  const mockJobInfoFormDataRepository = {
    find: jest.fn().mockReturnValue([]),
    save: jest.fn().mockReturnValue({}),
  };
  const mockPromotionJobInfoFormDataRepository = {
    save: jest.fn().mockReturnValue({}),
  };
  const mockNotificationRepository = {
    findOne: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LocationsModule],
    })
      .overrideProvider(getRepositoryToken(Locations))
      .useValue(mockLocationsRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockJobInfoFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockPromotionJobInfoFormDataRepository)
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

  it(':companyId/settings/employee-feilds/locations (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/locations')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/locations (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/locations')
      .expect(200)
      .expect([mockLocationsDto]);
  });

  it('settings/employee-feilds/locations/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/locations/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/locations/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/locations/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
