import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApprovalsModule } from '../src/settingsApprovals/module/module';
import { ApprovalsAll } from '../src/settingsApprovals/entities/approvalsAll.entity';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsApprovals (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockApprovalsAllDto = {
    id: '1',
    name: '',
    list: ['test'],
    createdAt: '2023-08-04',
    modifiedAt: '2023-08-04',
    companyId: '1',
  };

  const mockApprovalsAllRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(mockApprovalsAllDto),
  };
  const mockAccessLevelsRepository = {
    findOne: jest.fn().mockResolvedValue({}),
  };
  const mockAccessLevelsEmployeesRepository = {
    find: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
  };
  const mockApprovalsEmployeesRepository = {
    find: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApprovalsModule],
    })
      .overrideProvider(getRepositoryToken(ApprovalsAll))
      .useValue(mockApprovalsAllRepository)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mockAccessLevelsRepository)
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mockAccessLevelsEmployeesRepository)
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

  it(':companyId/settings/approvalsAll (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/approvalsAll')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/information-updates (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/information-updates')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/information-updates (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/information-updates')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/time-off-update (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/time-off-update')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/time-off-update (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/time-off-update')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/compensation-approval (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/compensation-approval')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/compensation-approval (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/compensation-approval')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/compensation-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/compensation-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/asset-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/asset-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/claim-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/claim-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/claim-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/claim-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/compensation-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/compensation-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/asset-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/asset-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/employement-status-approval (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/employement-status-approval')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/employement-status-approval (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/employement-status-approval')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/employement-status-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/employement-status-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/employement-status-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/employement-status-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/job-information-approval (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/job-information-approval')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/job-information-approval (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/job-information-approval')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/job-information-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/job-information-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/job-information-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/job-information-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/promotion-approval (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/promotion-approval')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/promotion-approval (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/promotion-approval')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/approvals/promotion-request (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/approvals/promotion-request')
      .expect(200)
      .expect(mockApprovalsAllDto.list);
  });

  it(':companyId/settings/approvals/promotion-request (PUT)', () => {
    return request(app.getHttpServer())
      .put('/1/settings/approvals/promotion-request')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
    });
});
