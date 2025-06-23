import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportTo } from '../src/jobInformation/entities/reportTo.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { claims } from '../src/claims/claims.entity';
import { ClaimsModule } from '../src/claims/claims.module';
import { Employee } from '../src/employee/entities/employee.entity';
import { CustomerSupportModule } from '../src/customer-support/module/customer-support.module';
import { customerSupport } from '../src/customer-support/entities/customerSupport.entity';
import { EmergencyContactsModule } from '../src/emergencyContacts/module/emergencyContacts.module';
import { EmergencyAddress } from '../src/emergencyContacts/entities/emergencyAddress.entity';
import { EmergencyContacts } from '../src/emergencyContacts/entities/emergencyContacts.entity';
import { EmergencyEmail } from '../src/emergencyContacts/entities/emergencyEmail.entity';
import { EmergencyPhone } from '../src/emergencyContacts/entities/emergencyPhone.entity';
import { CompanyLogoModule } from '../src/companyLogo/module/companyLogo.module';
import { CompanyLogo } from '../src/companyLogo/entities/companyLogoDocuments.entity';
import { CompanyLogoFolders } from '../src/companyLogo/entities/companyLogoFolders.entity';
import { EmergencyAddressDto } from '../src/emergencyContacts/dto/emergencyAddress.dto';
import { EmergencyPhoneDto } from '../src/emergencyContacts/dto/emergencyPhone.dto';
import * as multer from 'multer';
import { S3Service } from '../src/s3/service/service';
const globalPrefix = 'app/v1';
import * as fs from 'fs';
import { MockFileInterceptor } from './__mocks__/mockFileInterceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesModule } from '../src/files/module/files.module';
import { TimeTrackingService } from '../src/time-tracking/service/time-tracking.service';
import { Files } from '../src/files/entities/files.entity';
import { filesDto } from '../src/files/dto/Files.dto';
import { FilesFolders } from '../src/files/entities/filesFolders.entity';
import { filesFoldersDto } from '../src/files/dto/FilesFolders.dto';
import { GoalsModule } from '../src/goals/module/module';
import { Goals } from '../src/goals/entities/goals.entity';
import { GoalsComments } from '../src/goals/entities/goalsComments.entity';
import { GoalsDto } from '../src/goals/dto/goals.dto';
import { GoalsCommentsDto } from '../src/goals/dto/goalsComments.dto';
describe('GoalsController (e2e)', () => {
  let app: INestApplication;
  const goalsDto = {
    id: '',
    employeeId: '',
    objective: '',
    dueDate: '',
    shortDesc: '',
    attachFiles: [],
    closeGoal: {},
    shareWith: [],
    pogress: {},
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  const goalsCommentsDto = {
    id: '',
    goalId: '',
    comment: '',
    commenterId: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let employeeDto = {
    permanentAddress: {
      id: '',
    },
    phone: {
      work: 123,
    },
    email: {
      work: '',
    },
    fullName: {
      first: '',
      last: '',
    },
    employeeId: '',
    timezone: '',
    username: 'test@example.com',
    password: '#123',
    getStarted: '',
    emailVerified: '',
    employeeNo: 1,
    access: true,
    status: '',
    birthday: '',
    gender: '',
    maritalStatus: '',
    passportNumber: '',
    taxfileNumber: '',
    nin: '',
    vaccinated: true,
    doses: 1,
    reason: '',
    owner: true,
    hireDate: '2022-12-13',
    terminationDate: '',
    ethnicity: '',
    eeoCategory: '',
    shirtSize: '',
    allergies: '',
    dietaryRestric: '',
    secondaryLang: '',
    createdAt: '',
    modifiedAt: '',
    preferedName: '',
    online: false,
    profileImage: '',
  };
  let companyLogoFoldersDto = {
    id: '',
    folderName: '',
    folderType: '',
    description: '',
    icon: '',
    subFolder: true,
    path: [],
    parentFolder: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let companyLogoDto = {
    id: '',
    folderId: '',
    employeeId: '',
    fileName: '',
    uploaderId: '',
    share: true,
    fileLink: '',
    format: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  const mockEmployee = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          execute: jest.fn().mockResolvedValue({}),
        })),
      })),
    })),
    findOne: jest.fn().mockResolvedValue(employeeDto),
    find: jest.fn().mockResolvedValue([employeeDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(employeeDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockGoals = {
    findOne: jest.fn().mockResolvedValue(goalsDto),
    find: jest.fn().mockResolvedValue([goalsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(goalsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockGoalsComments = {
    findOne: jest.fn().mockResolvedValue(goalsCommentsDto),
    find: jest.fn().mockResolvedValue([goalsCommentsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(goalsCommentsDto),
    findOneOrFail: jest.fn().mockResolvedValue(goalsCommentsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockS3Service = {
    uploadDocument: jest.fn().mockResolvedValue({ Location: '' }),
  };
  const mockAuthGuard = {};
  const mockTimeTrackingService = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GoalsModule],
    })
      .overrideProvider(getRepositoryToken(Goals))
      .useValue(mockGoals)
      .overrideProvider(getRepositoryToken(GoalsComments))
      .useValue(mockGoalsComments)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/goals (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/goals')
      .send(goalsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/goals (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/goals')
      .expect(200)
      .expect([goalsDto]);
  });
  it(`/:companyId/goals/employee (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/goals/employee')
      .expect(200)
      .expect([{ employeeId: '', goals: [''] }]);
  });
  it(`/:companyId/goals/employee/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/goals/employee/:id')
      .expect(200)
      .expect({ employeeId: '', goals: [''] });
  });
  it(`/goals/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/goals/:id')
      .expect(200)
      .expect([goalsDto]);
  });
  it(`/goals/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/goals/:id')
      .send(goalsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/goals/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/goals/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/goals/comments (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/goals/comments')
      .send(goalsCommentsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/goals/comments (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/goals/comments')
      .expect(200)
      .expect([goalsCommentsDto]);
  });
  it(`/goals/comments/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/goals/comments/:id')
      .send(goalsCommentsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/goals/comments/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/goals/comments/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/goals/close (POST)`, () => {
    return request(app.getHttpServer())
      .put('/goals/close')
      .send({ close: true })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
