import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DepartmentModule } from '../src/settingsEmployeeFeildsDepartment/module/module';
import { Department } from '../src/settingsEmployeeFeildsDepartment/entities/department.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { JobInfoUpdateFormData } from '../src/notifications/entities/jobInfoUpdateFormData.entity';
import { PromotionJobInfoUpdateFormData } from '../src/notifications/entities/promotionJobInfoUpdateFormData.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsDepartment (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockDepartmentDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockDepartmentRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockReturnValue([mockDepartmentDto]),
    findOneOrFail: jest.fn().mockReturnValue({}),
    remove: jest.fn().mockReturnValue({}),
  };
  const mockJobInformationRepository = {
    count: jest.fn().mockReturnValue(1),
    find: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockJobInfoUpdateFormDataRepository = {
    find: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockPromotionJobInfoUpdateFormDataRepository = {
    find: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
  };
  const mockNotificationRequestRepository = {
    findOne: jest.fn().mockReturnValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DepartmentModule],
    })
      .overrideProvider(getRepositoryToken(Department))
      .useValue(mockDepartmentRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(JobInfoUpdateFormData))
      .useValue(mockJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(PromotionJobInfoUpdateFormData))
      .useValue(mockPromotionJobInfoUpdateFormDataRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/department (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/department')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/department (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/department')
      .expect(200)
      .expect([{
        count: 1,
        ...mockDepartmentDto,
      }]);
  });

  it('settings/employee-feilds/department/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/department/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/department/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/department/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
