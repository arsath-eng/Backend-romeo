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
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
jest.mock('fs');
describe('FilesController (e2e)', () => {
  let app: INestApplication;
  const FilesDto = {
    id: '',
    folderId: '',
    fileName: 'test',
    fileSize: '',
    uploaderId: '',
    sharedWithAll: true,
    sharedWith: [],
    fileLink: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/1213413`,
    format: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  const FilesFoldersDto = {
    id: '',
    folderName: '',
    folderType: '',
    sharedWithAll: true,
    sharedWith: [],
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
  const mockFilesFolders = {
    findOne: jest.fn().mockResolvedValue(FilesFoldersDto),
    find: jest.fn().mockResolvedValue([FilesFoldersDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(FilesFoldersDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockFiles = {
    findOne: jest.fn().mockResolvedValue(FilesDto),
    find: jest.fn().mockResolvedValue([FilesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(FilesDto),
    findOneOrFail: jest.fn().mockResolvedValue(FilesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockS3Service = {
    uploadDocument: jest.fn().mockResolvedValue({ Location: '' }),
    deleteObject: jest.fn().mockResolvedValue({}),
    uploadFile: jest.fn().mockResolvedValue({ Location: '' }),
  };
  const mockAuthGuard = {};
  const mock = {};
  const mockTimeTrackingService = {
    activityTrackingFunction: jest.fn().mockResolvedValue({}),
  };

  const mockApiService = {
    getCompanyById: jest.fn().mockResolvedValue({}),
  };

  const mockSampleFile = {
    fieldname: 'files',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    buffer: Buffer.from('test'),
    size: 4,
  };
  

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule],
    })

      .overrideProvider(getRepositoryToken(timeTrackingApproval))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(activityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Holiday))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HolidayAlert))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationDates))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(TimeOffRequestNotificationData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployeeData))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingEmployee))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(timeTrackingProjects))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Compensation))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(PaySchedules))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(FilesFolders))
      .useValue(mockFilesFolders)
      .overrideProvider(getRepositoryToken(Files))
      .useValue(mockFiles)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(S3Service)
      .useValue(mockS3Service)
      .overrideGuard(FilesInterceptor('files', 10))
      .useClass(MockFileInterceptor)
      .overrideProvider(TimeTrackingService)
      .useValue(mockTimeTrackingService)
      .overrideProvider(APIService)
      .useValue(mockApiService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/files/folders (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/files/folders')
      .send(FilesFoldersDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/files/folders (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/files/folders')
      .expect(200)
      .expect([FilesFoldersDto]);
  });
  it(`/files/folders/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/files/folders/:id')
      .expect(200)
      .expect(FilesFoldersDto);
  });
  it(`/files/folders/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/files/folders/:id')
      .send(FilesFoldersDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/files/folders/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/files/folders/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/files (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/files')
      .send({
        id: '',
        folderId: '',
        fileName: '',
        fileSize: '',
        uploaderId: '',
        sharedWithAll: true,
        sharedWith: [],
        fileLink: '',
        format: '',
        createdAt: '',
        modifiedAt: '',
        companyId: '',
        filesIdList: [],
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/upload-files (POST)`, () => {
    (fs.createReadStream as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .post('/:companyId/upload-files')
      .attach('files', mockSampleFile.buffer, mockSampleFile.originalname)
      .expect(201)
      .expect(['']);
  });
  it(`/:companyId/files (GET)`, () => {
    (fs.unlinkSync as jest.Mock).mockReturnValue({});
    (fs.existsSync as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .get('/:companyId/files')
      .expect(200)
      .expect([FilesDto]);
  });
  it(`/access-levels/files/employee/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/access-levels/files/employee/:id')
      .expect(200)
      .expect({
        employeeId: ':id',
        showFiles: true,
        folderIdList: [''],
        fileIdList: [''],
      });
  });
  it(`/files/:id (DELETE)`, () => {
    (fs.rename as unknown as jest.Mock).mockReturnValue({});
    return request(app.getHttpServer())
      .delete('/files/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/files/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/files/:id')
      .send(FilesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/files (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/files')
      .send({ fileIdList: [] })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
