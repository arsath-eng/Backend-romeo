import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TerminateReasonModule } from '../src/settingsEmployeeFeildsTerminateReason/module/module';
import { TerminateReason } from '../src/settingsEmployeeFeildsTerminateReason/entities/terminateReason.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsTermonateReason (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockTerminateReasonDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-05',
    modifiedAt: '2023-08-05',
    companyId: '1',
  };

  const mockTerminateReasonRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockTerminateReasonDto]),
    findOneOrFail: jest.fn().mockResolvedValue([mockTerminateReasonDto]),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeStatusRepository = {};
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TerminateReasonModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(TerminateReason))
      .useValue(mockTerminateReasonRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/terminate-reasons (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/terminate-reasons')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/terminate-reasons (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/terminate-reasons')
      .expect(200)
      .expect([mockTerminateReasonDto]);
  });

  it('settings/employee-feilds/terminate-reasons/:id', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/terminate-reasons/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/terminate-reasons/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/terminate-reasons/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
