import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmergencyContactRelationshipModule } from '../src/settingsEmployeeFeildsEmergencyContactRelationship/module/module';
import { EmergencyContactRelationship } from '../src/settingsEmployeeFeildsEmergencyContactRelationship/entities/contactRelationship.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsEmergencyContactRelationship (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockEmergencyContactRelationshipDto = {
    id: '1',
    name: '',
    createdAt: '2023-08-08',
    modifiedAt: '2023-08-08',
    companyId: '1',
  };

  const mockEmergencyContactRelationshipRepository = {
    find: jest.fn().mockResolvedValue([mockEmergencyContactRelationshipDto]),
    create: jest.fn().mockReturnValue(mockEmergencyContactRelationshipDto),
    save: jest.fn().mockResolvedValue(mockEmergencyContactRelationshipDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmergencyContactRelationshipModule],
    })
      .overrideProvider(getRepositoryToken(EmergencyContactRelationship))
      .useValue(mockEmergencyContactRelationshipRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/emergency-contact-relationship (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/emergency-contact-relationship')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/emergency-contact-relationship (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/emergency-contact-relationship')
      .expect(200)
      .expect([mockEmergencyContactRelationshipDto]);
  });

  it('settings/employee-feilds/emergency-contact-relationship/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/emergency-contact-relationship/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/emergency-contact-relationship/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/emergency-contact-relationship/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
