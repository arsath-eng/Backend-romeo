import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HiringCandidateStatusesModule } from '../src/settingsHiringCandidateStatuses/module/module';
import { HiringCandidateStatuses } from '../src/settingsHiringCandidateStatuses/entities/HiringCandidateStatuses.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('SettingsHiringCandidateStatuses (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockCandidateStatusesDto = {
    name:'',
    type:'',
    createAt: '2023-08-4',
    modifiedAt: '2023-08-4',
    companyId: '1',
  };
  const mockCandidateStatusesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockCandidateStatusesDto]),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HiringCandidateStatusesModule],
    })
      .overrideProvider(getRepositoryToken(HiringCandidateStatuses))
      .useValue(mockCandidateStatusesRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/hiring/candidate-satatuses (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/hiring/candidate-satatuses')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/hiring/candidate-satatuses (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/hiring/candidate-satatuses')
      .expect(200)
      .expect([mockCandidateStatusesDto]);
  });

  it('settings/hiring/candidate-satatuses/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/hiring/candidate-satatuses/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
