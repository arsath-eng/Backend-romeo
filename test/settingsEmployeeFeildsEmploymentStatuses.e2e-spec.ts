import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmploymentStatusesModule } from '../src/settingsEmployeeFeildsEmploymentStatuses/module/module';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { EmploymentStatuses } from '../src/settingsEmployeeFeildsEmploymentStatuses/entities/employmentStatuses.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsEmploymentStatuses (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockEmploymentStatusesDto = {
    id: '1',
    name: 'test',
    fte: 'test',
    createdAt: '2023-08-10',
    modifiedAt: '2023-08-10',
    companyId: '1',
  };

  const mockEmploymentStatusesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockEmploymentStatusesDto]),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeStatusRepository = {
    count: jest.fn().mockResolvedValue(1),
    find: jest.fn().mockResolvedValue([mockEmploymentStatusesDto]),
  };
  const mockEmployeeRepository = {};
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmploymentStatusesModule],
    })
      .overrideProvider(getRepositoryToken(EmploymentStatuses))
      .useValue(mockEmploymentStatusesRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/employment-statuses (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/employment-statuses')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/employment-statuses (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/employment-statuses')
      .expect(200)
      .expect([{count: 1, ...mockEmploymentStatusesDto}]);
  });

  it('settings/employee-feilds/employment-statuses/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/employment-statuses/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/employment-statuses/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/employment-statuses/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
