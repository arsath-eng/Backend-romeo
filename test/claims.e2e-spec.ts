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
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
import { mockSampleFile } from './__mocks__/mockSampleFile';
const globalPrefix = 'app/v1';

describe('ClaimsController (e2e)', () => {
  let app: INestApplication;
  let claimsDto = {
    id: "",
    employeeId: "",
    claimDate: "",
    claimCategory: "",
    claimComment: "",
    fileId: "",
    fileLink: "",
    comment: "",
    action: "",
    paidBy: "",
    status: "",
    amount: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: "",
  }
  let documentsDto = {
    id: "",
    employeeId: "",
    documentName: "",
    documentCategory: "",
    documentComment: "",
    fileId: "",
    fileLink: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: "",
  }
  let foldersDto = {}
  let notificationsDto = {}

  let employeeDto = { 
    employeeId: '',
    timezone: '',
    username: '',
    password: '',
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
    hireDate: '',
    terminationDate: '',
    ethnicity: '',
    eeoCategory: '',
    shirtSize: '',
    allergies: '',
    dietaryRestric: '',
    secondaryLang: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    preferedName: '',
    online: false,
    profileImage: '',
}
  const mockClaims = {
    findOne:jest.fn().mockResolvedValue(claimsDto),
    find:jest.fn().mockResolvedValue([claimsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  }
  const mockDocuments = {
    findOne:jest.fn().mockResolvedValue(documentsDto),
    find:jest.fn().mockResolvedValue([documentsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockReturnValue(documentsDto),
  }
  const mockFolders = {
    findOne:jest.fn().mockResolvedValue(foldersDto),
    find:jest.fn().mockResolvedValue([foldersDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockNotifications = {
    findOne:jest.fn().mockResolvedValue(notificationsDto),
    find:jest.fn().mockResolvedValue([notificationsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}
  const mockApiService = {
    getCompanyById:jest.fn().mockResolvedValue({}),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ClaimsModule],
    }).overrideProvider(getRepositoryToken(claims)).useValue(mockClaims)
      .overrideProvider(getRepositoryToken(Documents)).useValue(mockDocuments)
      .overrideProvider(getRepositoryToken(Folders)).useValue(mockFolders)
      .overrideProvider(getRepositoryToken(Notifications)).useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideProvider(APIService).useValue(mockApiService)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/upload-claim-file (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/upload-claim-file')
      .attach('files', mockSampleFile.buffer, mockSampleFile.originalname)
      .expect(201)
      .expect({documentId:'', fileLink:''})
  });
  it(`/:companyId/claims (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/claims')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/requests/claim-request/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/requests/claim-request/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/request/claim/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/request/claim/:id')
      .expect(200)
  });
  it(`/:companyId/claims-all? (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/claims-all?')
      .expect(200)
  });
  it(`/claims-all/:employeeId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/claims-all/:employeeId')
      .expect(200)
  });
  it(`/claims-single/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/claims-single/:id')
      .expect(200)
  });
});
