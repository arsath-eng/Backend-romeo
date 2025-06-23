import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HiringCandidateSourcesModule } from '../src/settingsHiringCandidateSources/module/module';
import { HiringCandidateSources } from '../src/settingsHiringCandidateSources/entities/HiringCandidateSources.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsHiringCandidateSources (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockHiringCandidateSources = {
    id: '1',
    name: '',
    createdAt: '2023-08-7',
    modifiedAt: '2023-08-7',
    companyId: '1',
  };

  const mockHiringCandidateSourcesRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([mockHiringCandidateSources]),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HiringCandidateSourcesModule],
    })
      .overrideProvider(getRepositoryToken(HiringCandidateSources))
      .useValue(mockHiringCandidateSourcesRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/hiring/candidates-sources (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/hiring/candidates-sources')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/hiring/candidates-sources (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/hiring/candidates-sources')
      .expect(200)
      .expect([mockHiringCandidateSources]);
  });

  it('settings/hiring/candidates-sources/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/hiring/candidates-sources/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
