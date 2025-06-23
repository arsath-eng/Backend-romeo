import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessLevelsEmployeesModule } from '../src/settingsAccessLevelsEmployees/module/module';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { ApprovalsAll } from '../src/settingsApprovals/entities/approvalsAll.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsAccessLevelsEmployees (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockAccessLevelsDto = {
    id: '1',
    accessLevelName: '',
    access: '',
    createdAt: '2023-08-10',
    modifiedAt: '2023-08-10',
    companyId: '1',
  };
  const mockAccessLevelsEmployeesDto = {
    id: '1',
    employeeId: '1',
    accessLevelId: '1',
    lastLogin: '2023-08-10',
    createdAt: '2023-08-10',
    modifiedAt: '2023-08-10',
    companyId: '1',
  };

  const mockApproveAllDto = {
    id: '1',
    name: '',
    list: [],
    createdAt: '2023-08-10',
    modifiedAt: '2023-08-10',
    companyId: '1',
    };

  const mockAccessLevelsEmployeesRepository = {
    findOne: jest.fn().mockResolvedValue(mockAccessLevelsEmployeesDto),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockResolvedValue([mockAccessLevelsEmployeesDto]),
    findOneOrFail: jest.fn().mockResolvedValue({}),
  };
  const mockAccessLevelsRepository = {
    findOne: jest.fn().mockResolvedValue(mockAccessLevelsDto),
  };
  const mockJobInformationRepository = {};
  const mockApprovalsAllRepository = {
    find: jest.fn().mockResolvedValue([mockApproveAllDto]),
  };
  const mockApprovalsEmployeesRepository = {
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {
    findOne: jest.fn().mockReturnValue(null),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccessLevelsEmployeesModule],
    })
      .overrideProvider(getRepositoryToken(AccessLevelsEmployees))
      .useValue(mockAccessLevelsEmployeesRepository)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mockAccessLevelsRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(ApprovalsAll))
      .useValue(mockApprovalsAllRepository)
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

  it('settings/access-levels/employee/:employeeId (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/access-levels/employee/1')
      .expect(200)
      .expect(mockAccessLevelsDto);
  });

  it(':companyId/settings/access-levels/employees (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/access-levels/employees')
      .send(mockAccessLevelsEmployeesDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      })
  });

  it(':companyId/settings/access-levels/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/access-levels/employees')
      .expect(200)
      .expect([mockAccessLevelsEmployeesDto]);
  });

  it('settings/access-levels/employees/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/access-levels/employees/1')
      .expect(200)
      .expect(mockAccessLevelsEmployeesDto);
  });

  it('settings/access-levels/employees/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/access-levels/employees/1')
      .send(mockAccessLevelsEmployeesDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      })
  });
});
