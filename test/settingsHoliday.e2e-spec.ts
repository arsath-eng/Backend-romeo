import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HolidayModule } from '../src/settingsHoliday/module/module';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';

describe('SettingsHoliday (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockHolidayDto = {
    id: 1,
    companyId: 1,
    name: '',
    access: [],
    createAt: '2023-08-3',
    modifiedAt: '2023-08-3',
  };

  const mockHolidayRepository = {
    find: jest.fn().mockReturnValue([mockHolidayDto]),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    findOne: jest.fn().mockReturnValue(mockHolidayDto),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformationRepository = {
    find: jest.fn().mockReturnValue([]),
  };
  const mockEmployeeStatusRepository = {
    find: jest.fn().mockReturnValue([]),
  };
  const mockEmployeeRepository = {
    find: jest.fn().mockReturnValue([]),
  };
  const mockNotificationRequestRepository = {
    save: jest.fn().mockReturnValue({}),
    findOne: jest.fn().mockReturnValue({}),
  };
  const mockHolidayAlertRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    findOne: jest.fn().mockReturnValue({}),
  };
  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};

  const mockAPIService = {
    getCompanyById: jest.fn().mockReturnValue({
      timezone: 'Asia/Colombo',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HolidayModule],
    })
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mockHolidayRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mockHolidayAlertRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideProvider(APIService)
      .useValue(mockAPIService)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/holidays (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/holidays')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/holidays (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/holidays')
      .expect(200)
      .expect([mockHolidayDto]);
  });

  it('settings/holidays/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/holidays/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/holidays/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/holidays/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
