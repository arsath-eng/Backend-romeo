import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TrainingCompleteModule } from '../src/trainingComplete/module/trainingComplete.module';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrainingModule } from '../src/training/module/module';
import { Documents } from '../src/documents/entities/documents.entity';
import { Training } from '../src/training/entities/Training.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { TrainingCategory } from '../src/training/entities/trainingCategory.entity';
import { TrainingComplete } from '../src/trainingComplete/entities/trainingComplete.entity';

describe('Training (e2e) ', () => {
  let app: INestApplication;

  const mockAuthGuard = {};
  const mockTrainingDto = {
    name: 'Employee Status',
    description: '',
    link: '',
    categoryId: '',
    hasCategory: false,
    frequency: '',
    repeat: '',
    every: 0,
    attachfiles: [],
    monthNo: [],
    required: false,
    requiredList: [{ name: 'Employee Status', list: ['test'] }],
    due: false,
    dueDate: 0,
    completedList: [],
    createdAt: '2023-06-06',
    modifiedAt: '2023-06-06',
    companyId: 1,
  };

  const mocktrainingRepository = {
    find: jest.fn().mockResolvedValue([mockTrainingDto]),
    create: jest.fn().mockReturnValue(mockTrainingDto),
    save: jest.fn().mockResolvedValue(mockTrainingDto),
    findOneOrFail: jest.fn().mockResolvedValue(mockTrainingDto),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockDocumentsRepository = {
    find: jest.fn().mockResolvedValue({}),
  };

  const mockFoldersRepository = {};

  const mockNotificationRequestRepository = {};

  const mockJobInformationRepository = {
    find: jest.fn().mockResolvedValue(1),
  };

  const mockEmployeeStatusRepository = {
    find: jest.fn().mockResolvedValue([{ employeeId: '1' }]),
  };

  const mockEmployeeRepository = {
    find: jest.fn().mockResolvedValue({}),
  };

  const mockTrainingCategoryRepository = {
    create: jest.fn().mockReturnValue(mockTrainingDto),
    save: jest.fn().mockResolvedValue(mockTrainingDto),
    find: jest.fn().mockResolvedValue({
      name: 'Employee Status',
    }),
    findOne: jest.fn().mockResolvedValue({ name: 'Employee Status' }),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockTrainingCompleteRepository = {
    find: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TrainingModule],
    })
      .overrideProvider(getRepositoryToken(Training))
      .useValue(mocktrainingRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatusRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(TrainingCategory))
      .useValue(mockTrainingCategoryRepository)
      .overrideProvider(getRepositoryToken(TrainingComplete))
      .useValue(mockTrainingCompleteRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/training (POST) ', () => {
    return request(app.getHttpServer())
      .post('/1/training')
      .send(mockTrainingDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/training (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/training')
      .expect(200)
      .expect([mockTrainingDto]);
  });

  it(':companyId/training/employee/:id (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/training/employee/1')
      .expect(200)
      .expect([mockTrainingDto]);
  });

  it('training/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/training/1')
      .send(mockTrainingDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('training/:id (DELETE) ', () => {
    return request(app.getHttpServer())
      .delete('/training/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/training-category (POST) ', () => {
    return request(app.getHttpServer())
      .post('/1/training-category')
      .send(mockTrainingDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/training-category (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/training-category')
      .expect(200)
      .expect({
        name: 'Employee Status',
      });
  });

  it('training-category/:id (GET) ', () => {
    return request(app.getHttpServer())
      .get('/training-category/1')
      .expect(200)
      .expect({name: 'Employee Status'});
  });

  it('training-category/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/training-category/1')
      .send(mockTrainingDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('training-category/:id (DELETE) ', () => {
    return request(app.getHttpServer())
      .delete('/training-category/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
