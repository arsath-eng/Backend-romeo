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
import { mockSampleFile } from './__mocks__/mockSampleFile';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
jest.mock('fs');
describe('CompanyLogoController (e2e)', () => {
  let app: INestApplication;
  let employeeDto = { 
    permanentAddress: {
      id: ""
    },
    phone: {
      work:123
    },
    email: {
      work: ""
    },
    fullName: {
      first:"",
      last:""
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
    createdAt: "",
    modifiedAt: "",
    preferedName: '',
    online: false,
    profileImage: '',
  }
  let companyLogoFoldersDto = {
    id: "",
    folderName: "",
    folderType: "",
    description: "",
    icon: "",
    subFolder: true,
    path: [],
    parentFolder: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  let companyLogoDto = {
    id: "",
    folderId: "",
    employeeId: "",
    fileName: "",
    uploaderId: "",
    share: true,
    fileLink: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
    format: "",
    createdAt: "",
    modifiedAt: "",
    companyId: "",
  }
  const mockEmployee = {
    createQueryBuilder: jest.fn(() => ({
      delete:jest.fn(() => ({
        where:jest.fn(() => ({
          execute:jest.fn().mockResolvedValue({})
        })),
      })),
    })),
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(employeeDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockCompanyLogoFolders = {
    findOne:jest.fn().mockResolvedValue(companyLogoFoldersDto),
    find:jest.fn().mockResolvedValue([companyLogoFoldersDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(companyLogoFoldersDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockCompanyLogo = {
    findOne:jest.fn().mockResolvedValue(companyLogoDto),
    find:jest.fn().mockResolvedValue([companyLogoDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue(companyLogoDto),
    findOneOrFail:jest.fn().mockResolvedValue(companyLogoDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockS3Service = {
    uploadDocument:jest.fn().mockResolvedValue({Location: ""}),
  }
  const mockAuthGuard = {}

  const mockDocument = {
    find: jest.fn().mockResolvedValue([companyLogoDto]),
  }
  const mockFolder = {}
  const mockNotification = {}
  const mockApiService = {
    getCompanyById : jest.fn().mockResolvedValue({}),
  }


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CompanyLogoModule],
    })
      .overrideProvider(getRepositoryToken(CompanyLogoFolders)).useValue(mockCompanyLogoFolders)
      .overrideProvider(getRepositoryToken(CompanyLogo)).useValue(mockCompanyLogo)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .overrideProvider(S3Service).useValue(mockS3Service)
      .overrideProvider(getRepositoryToken(Documents)).useValue(mockDocument)
      .overrideProvider(getRepositoryToken(Folders)).useValue(mockFolder)
      .overrideProvider(getRepositoryToken(Notifications)).useValue(mockNotification)
      .overrideProvider(APIService)
      .useValue(mockApiService)
      .overrideGuard(FilesInterceptor('files', 10)).useClass(MockFileInterceptor)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/logo-folders (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/logo-folders')
      .send(companyLogoFoldersDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/logo-folders (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/logo-folders')
      .expect(200)
      .expect([companyLogoFoldersDto])
  });
  it(`/logo-folders/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/logo-folders/:id')
      .send(companyLogoFoldersDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/logo-folders/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/logo-folders/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/logo-documents (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/logo-documents')
      .send({
        files: [],
        id: "",
        folderId: "",
        employeeId: "",
        fileName: "",
        uploaderId: "",
        share: true,
        fileLink: "",
        format: "",
        createdAt: "",
        modifiedAt: "",
        companyId: "",
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/upload-logo (POST)`, () => {
    (fs.createReadStream as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .post('/upload-logo')
      .attach('files', mockSampleFile.buffer, mockSampleFile.originalname)
      .expect(200)
      .expect([""])
  });
  it(`/:companyId/logo-documents (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/logo-documents')
      .expect(200)
      .expect([companyLogoDto])
  });
  it(`/logo-documents/:id (DELETE)`, () => {
    (fs.unlinkSync as jest.Mock).mockReturnValue({});
    (fs.existsSync as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .delete('/logo-documents/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/logo-documents/:id (PUT)`, () => {
    (fs.rename as unknown as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .put('/logo-documents/:id')
      .send(companyLogoDto)
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
