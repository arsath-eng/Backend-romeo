import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WellbeingModule } from '../src/settingsEmployeeWellBeing/module/module';
import { Wellbeing } from '../src/settingsEmployeeWellBeing/entities/wellbeing.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { WellbeingNotification } from '../src/notifications/entities/wellbeingNotification.entity';
import { WellbeingEmployees } from '../src/wellbeing/entities/wellbeingEmployees.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeWellBeing (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockWellbeingDto = {
    id: '1',
    companyId: '1',
    wellbeing: {},
    schedule: {
      sendDate: '2023-08-07',
    },
    executionCount: 1,
    createdAt: '2023-08-07',
    modifiedAt: '2023-08-07',
  };

  const mockWellbeingRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(mockWellbeingDto),
  };

  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};
  const mockNotificationRequestRepository = {};
  const mockWellbeingNotificationRepository = {};
  const mockWellbeingEmployeesRepository = {};
  const mockEmployeeStatusRepository = {};
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WellbeingModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(WellbeingEmployees))
      .useValue(mockWellbeingEmployeesRepository)
      .overrideProvider(getRepositoryToken(WellbeingNotification))
      .useValue(mockWellbeingNotificationRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(Wellbeing))
      .useValue(mockWellbeingRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-wellbeing (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-wellbeing')
      .expect(200)
      .send(mockWellbeingDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-wellbeing (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-wellbeing')
      .expect(200)
      .expect(mockWellbeingDto);
  });

  it('settings/employee-wellbeing/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-wellbeing/1')
      .expect(200)
      .send(mockWellbeingDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
