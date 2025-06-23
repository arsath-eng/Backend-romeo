import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SatisfactionModule } from '../src/settingsEmployeeSatisfaction/module/module';
import { Satisfaction } from '../src/settingsEmployeeSatisfaction/entities/satisfaction.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { SatisfactionNotification } from '../src/settingsEmployeeSatisfaction/entities/satisfactionNotification.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeSatisfaction (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockSatisfactionDto = {
    id: '1',
    companyId: '1',
    terminateDate: '2023-08-07',
    include: true,
    sendDate: '2023-08-07',
    showFrom: '',
    emailMessage: '',
    repeatEvery: '',
    getENPS: true,
    active: true,
    ongoing: true,
    createdAt: '2023-08-07',
    modifiedAt: '2023-08-07',
  };

  const mockSatisfactionRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue([mockSatisfactionDto]),
  };
  const mockEmployeeStatusRepository = {};
  const mockSatisfactionNotificationRepository = {};
  const mockNotificationsRepository = {};
  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SatisfactionModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(SatisfactionNotification))
      .useValue(mockSatisfactionNotificationRepository)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotificationsRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(Satisfaction))
      .useValue(mockSatisfactionRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-satisfaction (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-satisfaction')
      .expect(200)
      .send(mockSatisfactionDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-satisfaction (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-satisfaction')
      .expect(200)
      .expect([mockSatisfactionDto]);
  });

  it('settings/employee-satisfaction/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-satisfaction/1')
      .expect(200)
      .send(mockSatisfactionDto)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
