import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompensationChangeReasonModule } from '../src/settingsEmployeeFeildsCompensationChangeReason/module/module';
import { CompensationChangeReason } from '../src/settingsEmployeeFeildsCompensationChangeReason/entities/compensationChangeReason.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsCompensationChangeReason (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockCompensationChangeReasonDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockCompensationChangeReasonRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue(mockCompensationChangeReasonDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockCompensationRepository = {
    find: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CompensationChangeReasonModule],
    })
      .overrideProvider(getRepositoryToken(CompensationChangeReason))
      .useValue(mockCompensationChangeReasonRepository)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mockCompensationRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/compensation-change-reason (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/compensation-change-reason')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/compensation-change-reason (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/compensation-change-reason')
      .expect(200)
      .expect(mockCompensationChangeReasonDto);
  });

  it('settings/employee-feilds/compensation-change-reason/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/compensation-change-reason/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/compensation-change-reason/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/compensation-change-reason/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
