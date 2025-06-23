import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaySchedulesModule } from '../src/settingsEmployeeFeildsPaySchedules/module/module';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { CompensationFormData } from '../src/notifications/entities/compensationFormData.entity';
import { PromotionCompensationFormData } from '../src/notifications/entities/promotionCompensationFormData.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsPaySchedules (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockPayScheduleDto = {
    id: '1',
    name: '',
    frequency: '',
    payDay: '',
    payDayLands: '',
    deduction: false,
    periodEndDate: [],
    createdAt: '2023-08-07',
    modifiedAt: '2023-08-07',
    companyId: '1',
  };

  const mockPaySchedulesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockPayScheduleDto]),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockCompensationRepository = {
    count: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCompensationFormDataRepository = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockPromotionCompensationFormDataRepository = {
    save: jest.fn().mockResolvedValue({}),
  };
  const mockNotificationRepository = {
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaySchedulesModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mockPaySchedulesRepository)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mockCompensationRepository)
      .overrideProvider(getRepositoryToken(CompensationFormData))
      .useValue(mockCompensationFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionCompensationFormData))
      .useValue(mockPromotionCompensationFormDataRepository)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotificationRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/pay-schedules (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/pay-schedules')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/pay-schedules (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/pay-schedules')
      .expect(200)
      .expect([mockPayScheduleDto]);
  });

  it('settings/employee-feilds/pay-schedules/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/pay-schedules/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/pay-schedules/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/pay-schedules/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
