import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TrainingCompleteModule } from '../src/trainingComplete/module/trainingComplete.module';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';

describe('TrainingComplete (e2e) ', () => {
  let app: INestApplication;

  const mockAuthGuard = {};
  const mockTrainingCompleteDto = {
    trainingId: '',
    note: '',
    attachFiles: [],
    employeeId: '1',
    cost: '',
    completedDate: '',
    currency: '',
    credits: '',
    hours: '',
    instructor: '',
    createdAt: '2021-08-31',
    modifiedAt: '2021-08-31',
    companyId: '1',
  };

  const mockTrainingCompleteRepository = {
    create: jest.fn().mockResolvedValue(mockTrainingCompleteDto),
    save: jest.fn().mockResolvedValue(mockTrainingCompleteDto),
    find: jest.fn().mockResolvedValue([mockTrainingCompleteDto]),
    findOne: jest.fn().mockResolvedValue(mockTrainingCompleteDto),
    findOneOrFail: jest.fn().mockResolvedValue(mockTrainingCompleteDto),
    remove: jest.fn().mockResolvedValue(mockTrainingCompleteDto),
  };

  const mockEmployeeRepository = {
    findOne: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TrainingCompleteModule],
    })
      .overrideProvider(getRepositoryToken(HrmTrainingComplete))
      .useValue(mockTrainingCompleteRepository)
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/training-complete (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/training-complete')
      .send(mockTrainingCompleteDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/training-complete (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/training-complete')
      .expect(200)
      .expect([mockTrainingCompleteDto]);
  });

  it('training-complete/employee/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/training-complete/employee/1')
      .expect(200)
      .expect([mockTrainingCompleteDto]);
  });

  it('training-complete/:id (Put)', () => {
    return request(app.getHttpServer())
      .put('/training-complete/1')
      .send({})
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('training-complete/:id (Delete)', () => {
    return request(app.getHttpServer())
      .delete('/training-complete/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
