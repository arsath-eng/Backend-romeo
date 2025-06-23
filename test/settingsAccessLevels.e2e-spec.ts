import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessLevelsModule } from '../src/settingsAccessLevels/module/module';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsAccessLevels (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockAccessLevelsDto = {
    id: '1',
    accessLevelName: '',
    accessLevelType: '',
    access: {},
    createdAt: '2023-08-10',
    modifiedAt: '2023-08-10',
    companyId: '1',
  };

  const mockAccessLevelsRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockAccessLevelsDto]),
    findOne: jest.fn().mockReturnValue(mockAccessLevelsDto),
    findOneOrFail: jest.fn().mockReturnValue(mockAccessLevelsDto),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccessLevelsModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(AccessLevels))
      .useValue(mockAccessLevelsRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/access-levels (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/access-levels')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/access-levels (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/access-levels')
      .expect(200)
      .expect([mockAccessLevelsDto]);
  });

  it('settings/access-levels/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/access-levels/1')
      .expect(200)
      .expect(mockAccessLevelsDto);
  });

  it('settings/access-levels/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/access-levels/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/access-levels/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/access-levels/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
