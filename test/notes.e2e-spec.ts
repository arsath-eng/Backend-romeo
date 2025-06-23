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
import { NewPerformanceModule } from '../src/new-performance/module/new-performance.module';
import { newPerformanceTask } from '../src/new-performance/entity/newPerformanceTask.entity';
import { newPerformanceComment } from '../src/new-performance/entity/newPerformanceComment.entity';
import { NotesModule } from '../src/notes/module/notes.module';
import { Notes } from '../src/notes/entities/notes.entity';
describe('NotesController (e2e)', () => {
  let app: INestApplication;
  const notesDto = {
    id: '',
    employeeId: '',
    senderId: '',
    senderName: '',
    note: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
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
  const mockNotes = {
    findOne: jest.fn().mockResolvedValue(notesDto),
    find: jest.fn().mockResolvedValue([notesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(notesDto),
    findOneOrFail: jest.fn().mockResolvedValue(notesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAuthGuard = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotesModule],
    })
      .overrideProvider(getRepositoryToken(Notes))
      .useValue(mockNotes)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/notes (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/notes')
      .send(notesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/notes (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/notes')
      .expect(200)
      .expect([notesDto]);
  });
  it(`/notes/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/notes/:id')
      .expect(200)
      .expect([notesDto]);
  });
  it(`/notes/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/notes/:id')
      .send(notesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/notes/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/notes/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
