import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeOffCategoryModule } from '../src/timeOffCategory/module/timeOffCategory.module';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('TimeOffCategory (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mockTimeOffCategoryDto = {
    timeoffNo: 1,
    name: '',
    units: '',
    icon: '',
    type: '',
    fileUpload: false,
    fileRequiredLimit: 1,
    noPay: false,
    coverupPerson: false,
    color: '',
    createdAt: '2023-07-31',
    modifiedAt: '2023-07-31',
    companyId: '',
  };

  const mockTimeOffCategoryRepository = {
    create: jest.fn().mockReturnValue(mockTimeOffCategoryDto),
    save: jest.fn().mockResolvedValue(mockTimeOffCategoryDto),
    find: jest.fn().mockResolvedValue([mockTimeOffCategoryDto]),
    findOneOrFail: jest.fn().mockResolvedValue(mockTimeOffCategoryDto),
    remove: jest.fn().mockResolvedValue(mockTimeOffCategoryDto),
  };

  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TimeOffCategoryModule],
    })
      .overrideProvider(getRepositoryToken(TimeOffCategory))
      .useValue(mockTimeOffCategoryRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/timeoff-categories (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/timeoff-categories')
      .send(mockTimeOffCategoryDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/timeoff-categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/timeoff-categories')
      .expect(200)
      .expect([mockTimeOffCategoryDto]);
  });

  it('timeoff-categories/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/timeoff-categories/1')
      .expect(200)
      .expect([mockTimeOffCategoryDto]);
  });

  it('timeoff-categories/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/timeoff-categories/1')
      .send(mockTimeOffCategoryDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('timeoff-categories/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/timeoff-categories/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

});
