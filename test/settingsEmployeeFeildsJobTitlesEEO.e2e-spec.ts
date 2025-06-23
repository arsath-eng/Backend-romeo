import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobTitlesEEOModule } from '../src/settingsEmployeeFeildsJobTitlesEEO/module/module';
import { JobTitlesEEO } from '../src/settingsEmployeeFeildsJobTitlesEEO/entities/jobTitlesEEO.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobTitles } from '../src/settingsEmployeeFeildsJobTitles/entities/jobTitles.entity';

describe('settingsEmployeeFeildsJobTitlesEEO (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockJobTitlesEEODto = {
    id: '1',
    name: '',
    callName: '',
    list: [],
    createdAt: '2023-06-08',
    modifiedAt: '2023-06-08',
    companyId: '1',
  };

  const mockJobTitlesEEORepository = {
    find: jest.fn().mockResolvedValue([mockJobTitlesEEODto]),
    findOne: jest.fn().mockResolvedValue({}),

  };
  const mockEmployeeRepository = {
    findOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformationRepository = {
    find: jest.fn().mockResolvedValue({}),
  };
  const mockJobTitlesRepository = {
    findOne: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JobTitlesEEOModule],
    })
      .overrideProvider(getRepositoryToken(JobTitlesEEO))
      .useValue(mockJobTitlesEEORepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobTitles))
      .useValue(mockJobTitlesRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/job-title-eeo (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/job-title-eeo')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/job-title-eeo (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/job-title-eeo')
      .expect(200)
      .expect({
        [mockJobTitlesEEODto.callName]: mockJobTitlesEEODto,
      })
  });

  it('settings/employee-feilds/job-title-eeo (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/job-title-eeo')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
