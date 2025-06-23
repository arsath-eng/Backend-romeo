import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SatisfactionEmployeesModule } from '../src/satisfaction/module/module';
import { SatisfactionEmployees } from '../src/satisfaction/entities/satisfactionEmployees.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('satisfaction (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockSatisfactionDto = {
    id: '1',
    employeeId: '1',
    Comment: 'test',
    rate: 1,
    getENPS: true,
    eNPS: 1,
    likesTags: ['test'],
    dislikeTags: ['test'],
    surveyPeriod: 'test',
    createdAt: '2023-08-08',
    modifiedAt: '2023-08-08',
    companyId: '1',
  };

  const mockSatisfactionEmployeesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockSatisfactionDto]),
    findOne: jest.fn().mockReturnValue({}),
    findOneOrFail: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SatisfactionEmployeesModule],
    })
      .overrideProvider(getRepositoryToken(SatisfactionEmployees))
      .useValue(mockSatisfactionEmployeesRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/employee-satisfaction (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/employee-satisfaction')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('employee-satisfaction/:companyId (GET)', () => {
    return request(app.getHttpServer())
      .get('/employee-satisfaction/1')
      .expect(200)
      .expect([mockSatisfactionDto]);
  });

  it('employee-satisfaction/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/employee-satisfaction/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
