import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShirtSizeModule } from '../src/settingsEmployeeFeildsShirtSize/module/module';
import { ShirtSize } from '../src/settingsEmployeeFeildsShirtSize/entities/shirtSize.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsShirtSize (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockShirtSizeDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-07',
    modifiedAt: '2023-08-07',
    companyId: '1',
    };

  const mockShirtSizeRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue(mockShirtSizeDto),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };

  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ShirtSizeModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(ShirtSize))
      .useValue(mockShirtSizeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/shirt-size (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/shirt-size')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/shirt-size (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/shirt-size')
      .expect(200)
      .expect(mockShirtSizeDto);
  });

  it('settings/employee-feilds/shirt-size/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/shirt-size/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/shirt-size/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/shirt-size/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
