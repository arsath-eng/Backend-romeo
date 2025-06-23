import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { TimeOffInformationModule } from '../src/timeOffInformation/module/timeOffInformation.module';
import { Employee } from '../src/employee/entities/employee.entity';

describe('TimeOffInformation (e2e)', () => {
  let app: INestApplication;

  const mockAuthGuard = {};
  const mockTimeOffInformationDto = {
    employeeId: '',
    categoryId: '',
    totalDays: 0,
    usedDays: 0,
    categoryName: '',
    createdAt: '2023-06-06',
    modifiedAt: '2023-06-06',
    companyId: 1,
  };

  const mockTimeOffInformationRepository = {
    find: jest.fn().mockResolvedValue([mockTimeOffInformationDto]),
    create: jest.fn().mockReturnValue(mockTimeOffInformationDto),
    save: jest.fn().mockResolvedValue(mockTimeOffInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(mockTimeOffInformationDto),
  };

  const mockEmployeeRepository = {};
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TimeOffInformationModule],
    })
      .overrideProvider(getRepositoryToken(TimeOffInformation))
      .useValue(mockTimeOffInformationRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/timeoff-information (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/timeoff-information')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/timeoff-information (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/timeoff-information')
      .expect(200)
      .expect([mockTimeOffInformationDto]);
  });

  it('timeoff-information/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/timeoff-information/1')
      .expect(200)
      .expect([mockTimeOffInformationDto]);
  });

  it('timeoff-information/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/timeoff-information/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
