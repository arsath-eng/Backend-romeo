import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesEmailsModule } from '../src/candidatesEmails/module/candidatesEmails.module';
import { AuthGuard } from '@nestjs/passport';
import { EmailsNewService } from '../src/ses/service/emails.service';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrmFolders } from '@flows/allEntities/hrmFolders.entity';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmAnnouncements } from '@flows/allEntities/announcements.entity';
import { HrmActivityTracking } from '@flows/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '@flows/allEntities/assetsClaims.entity';
import { HrmAttendance } from '@flows/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '@flows/allEntities/boardingTaskEmployees.entity';
import { HrmCustomerSupport } from '@flows/allEntities/customerSupport.entity';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
import { HrmNotes } from '@flows/allEntities/notes.entity';
import { HrmOfferLetter } from '@flows/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import { HrmReports } from '@flows/allEntities/reports.entity';
import { HrmTalentPools } from '@flows/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import { HrmVerification } from '@flows/allEntities/verification.entity';
import { hrmPayroll } from '@flows/allEntities/hrmPayroll.entity';
import { AppModule } from '@flows/app.module';
import { DataSourceModule } from '../db/data-source';
import { DataSource } from 'typeorm';


describe('CandidatesEmailsController (e2e)', () => {
  let app: INestApplication;

  const mockAuthGuard = {};
  const mockCandidatesEmailsDto = {
    sender: '',
    receiver: [1],
    subject: '',
    status: '',
    content: 'mock content',
    attachments: '',
    companyId: '1',
  };

  const mockDocumentsDto = {
    folderId: '',
    employeeId: '',
    fileName: '',
    uploaderId: '',
    share: true,
    fileLink: '',
    format: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: '',
  };

  const mockFoldersDto = {
    folderName: '',
    folderType: '',
    description: '',
    icon: '',
    subFolder: true,
    path: '',
    parentFolder: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: '',
  };

  const mockNotificationRequestDto = {
    type: '',
    data: '',
    hidden: true,
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: '',
  };

  const mockJobApplicationDto = {
    jobOpeningId: '',
    jobOpeningTitle: '',
    firstName: '',
    archived: true,
    lastName: '',
    email: '',
  };

  const mockCandidatesEmails = {
    create: jest.fn().mockResolvedValue(mockCandidatesEmailsDto),
    save: jest.fn().mockResolvedValue(mockCandidatesEmailsDto),
    find: jest.fn().mockResolvedValue([mockCandidatesEmailsDto]),
  };

  const mockDocuments = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };

  const mockFoldersRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };

  const mockNotificationRequestRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };

  const mockJobApplicationRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
  };

  const mockEmployeeRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };

  const mockMailService = {
    hiring: jest.fn().mockResolvedValue({}),
  };

  const mockHiring = {
    query: jest.fn().mockImplementation((query) => {
      if (query.startsWith('SELECT * FROM hrm_hiring WHERE type = \'hrm_hiring_candidates\' AND companyId =')) {
        return Promise.resolve([{
          id: "",
          type: "",
          data: {
            candidatesEmails: ['testEmail']
          }
        }]);
      }
      return Promise.resolve([]);
    }),
  }

  const mock = {}
  const mockDatasource = {
    query: jest.fn().mockImplementation((query, params) => {
      if (query === 'SELECT * FROM hrm_hiring WHERE  id= ANY($1) AND type=$2' && params[1] === "hrm_hiring_candidates") {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(HrmFolders))
      .useValue(mockFoldersRepository)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mockNotificationRequestRepository)
      .overrideProvider(getRepositoryToken(hrmHiring))
      .useValue(mockHiring)
      .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(HrmNotifications))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmConfigs))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAnnouncements))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmActivityTracking))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAssetsClaims))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmAttendance))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmBoardingTaskEmployees))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmCustomerSupport))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmFiles))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmNotes))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmOfferLetter))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmPerformanceTask))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmReports))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmTalentPools))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmTrainingComplete))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(HrmVerification))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(hrmPayroll))
      .useValue(mock)
      .overrideProvider(DataSource)
      .useValue(mockDatasource)
      .overrideProvider(EmailsNewService)
      .useValue(mockMailService)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/hiring/candidates/emails (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/hiring/candidates/emails')
      .send(mockCandidatesEmailsDto)
      .expect(200);
  });

  it(':companyId/hiring/emails/candidates (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/hiring/emails/candidates')
      .expect(200)
      .expect(['testEmail']);
  });

  describe("hiring/candidates/:id/emails (GET)", () => {
    it('Existing Id hiring/candidates/:id/emails (GET)', () => {
      return request(app.getHttpServer())
        .get('/hiring/candidates/1/emails')
        .expect(200)
        .expect([]);
    }
    );

    it('Non Existing Id hiring/candidates/:id/emails (GET)', () => {
      return request(app.getHttpServer())
        .get('/hiring/candidates/2/emails')
        .expect(200)
        .expect([]);
    }
    );
  });
});
