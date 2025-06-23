import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DegreeModule } from '../src/settingsEmployeeFeildsDegree/module/module';
import { Degree } from '../src/settingsEmployeeFeildsDegree/entities/degree.entity';
import { Employee } from '../src/employee/entities/employee.entity';
describe('settingsEmployeeFeildsDegree (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockDegreeDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockDegreeRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue(mockDegreeDto),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DegreeModule],
    })
      .overrideProvider(getRepositoryToken(Degree))
      .useValue(mockDegreeRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/degree (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/degree')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/degree (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/degree')
      .expect(200)
      .expect(mockDegreeDto);
  });

  it('settings/employee-feilds/degree/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/degree/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/degree/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/degree/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
