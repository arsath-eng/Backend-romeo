import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApprovalsEmployeesModule } from '../src/settingsApprovalsEmployees/module/module';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsApprovalsEmployees (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockApprovalsEmployeesDto = {
    id: '1',
    employeeId: '1',
    informationUpdate: true,
    timeoffUpdate: true,
    compensationApproval: true,
    employementStatusApproval: true,
    employementStatusRequest: true,
    jobInformationApproval: true,
    jobInformationRequest: true,
    promotionApproval: true,
    promotionRequest: true,
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockApprovalsEmployeesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockApprovalsEmployeesDto]),
    findOne: jest.fn().mockResolvedValue(mockApprovalsEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApprovalsEmployeesModule],
    })
      .overrideProvider(getRepositoryToken(ApprovalsEmployees))
      .useValue(mockApprovalsEmployeesRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/approvals/employees (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/approvals/employees')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/employees')
      .expect(200)
      .expect([mockApprovalsEmployeesDto]);
  });

  it('settings/approvals/employees/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/approvals/employees/1')
      .expect(200)
      .expect(mockApprovalsEmployeesDto);
  });

  it('settings/approvals/employees/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/approvals/employees/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
