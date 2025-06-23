import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HiringEmailTemplatesModule } from '../src/settingsHiringEmailTemplates/module/module';
import { HiringEmailTemplates } from '../src/settingsHiringEmailTemplates/entities/HiringEmailTemplates.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('SettingsHiringEmailTemplates (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mockHiringEmailTemplatesDto = {
    name: '',
    subject: '',
    emailTemplate: '',
    createdAt: '2023-08-3',
    modifiedAt: '2023-08-3',
    companyId: '1',
  };

  const mockHiringEmailTemplatesRepository = {
    create: jest.fn().mockResolvedValue(mockHiringEmailTemplatesDto),
    save: jest.fn().mockResolvedValue(mockHiringEmailTemplatesDto),
    find: jest.fn().mockResolvedValue([mockHiringEmailTemplatesDto]),
    findOne: jest.fn().mockResolvedValue(mockHiringEmailTemplatesDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HiringEmailTemplatesModule],
    })
      .overrideProvider(getRepositoryToken(HiringEmailTemplates))
      .useValue(mockHiringEmailTemplatesRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/hiring/email-templates (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/hiring/email-templates')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/hiring/email-templates (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/hiring/email-templates')
      .expect(200)
      .expect([mockHiringEmailTemplatesDto]);
  });

  it('settings/hiring/email-templates/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/settings/hiring/email-templates/1')
      .expect(200)
      .expect(mockHiringEmailTemplatesDto);
  });

  it('settings/hiring/email-templates/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/hiring/email-templates/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/hiring/email-templates/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/hiring/email-templates/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
