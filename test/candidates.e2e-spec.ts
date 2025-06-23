import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendanceModule } from '../src/attendance/module/attendance.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceService } from '../src/attendance/service/attendance.service';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { CandidatesModule } from '../src/candidates/module/candidates.module';
import { HrmEmployeeDetails } from '../src/allEntities/employeeDetails.entity';
import { HrmNotifications } from '../src/allEntities/notifications.entity';
import { HrmConfigs } from '../src/allEntities/configs.entity';
import { HrmAnnouncements } from '../src/allEntities/announcements.entity';
import { HrmActivityTracking } from '../src/allEntities/activityTracking.entity';
import { HrmAssetsClaims } from '../src/allEntities/assetsClaims.entity';
import { HrmAttendance } from '../src/allEntities/attendance.entity';
import { HrmBoardingTaskEmployees } from '../src/allEntities/boardingTaskEmployees.entity';
import { HrmCustomerSupport } from '../src/allEntities/customerSupport.entity';
import { HrmFiles } from '../src/allEntities/hrmFiles.entity';
import { HrmFolders } from '../src/allEntities/hrmFolders.entity';
import { HrmNotes } from '../src/allEntities/notes.entity';
import { HrmOfferLetter } from '../src/allEntities/offerLetter.entity';
import { HrmPerformanceTask } from '../src/allEntities/performanceTask.entity';
import { HrmReports } from '../src/allEntities/reports.entity';
import { HrmTalentPools } from '../src/allEntities/talentPools.entity';
import { HrmTrainingComplete } from '../src/allEntities/trainingComplete.entity';
import { HrmVerification } from '../src/allEntities/verification.entity';
import { hrmHiring } from '../src/allEntities/hrmHiring.entity';
import { hrmPayroll } from '../src/allEntities/hrmPayroll.entity';
import { AppModule } from '@flows/app.module';
const globalPrefix = 'app/v1';

describe('CandidatesController (e2e)', () => {
  let app: INestApplication;
  let JobDescriptionDto = {};
  let JobOpeningsMainDto = {};
  let PostJobDto = {};
  let CandidatesCommentsDto = {};
  let CandidatesRepliesDto = {};
  let CandidatesHistoryDto = {};
  let CandidatesHistoryActivityDto = {};
  let AdditionalQuestionsDto = {};
  let AdditionalQuestionsChoicesDto = {};
  let ApplicationQuestionsDto = {};
  let CreatorDto = {};
  let JobApplicationDto = {
    id: '',
    jobOpeningId: '',
    jobOpeningTitle: '',
    firstName: '',
    archived: true,
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    companyId: '',
    status: {
      id: '',
      name: '',
      comment: '',
    },
  };
  let JobApplicationStatusDto = {};
  let ViewListDto = {};
  let CollobaratorsDto = {};
  let CollobaratorsMainDto = {};
  let EmployeeDto = {
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
  };
  const mockCandidateDto = {
    additionalQuestions: [''],
    address: '',
    applicant: true,
    applicationQuestions: {},
    archived: true,
    city: '',
    companyId: '',
    country: '',
    createdAt: '2023-10-02T09:01:06.009Z',
    disability: '',
    email: '',
    ethnicity: '',
    firstName: '',
    gender: '',
    id: '',
    jobOpeningId: '',
    jobOpeningTitle: '',
    lastName: '',
    modifiedAt: '2023-10-02T09:01:06.009Z',
    offer: true,
    other: true,
    phone: '',
    postalCode: '',
    province: '',
    rating: '',
    status: {
      id: '',
      name: '',
      comment: '',
    },
    veteranStatus: '',
  };

  const mockJobDescription = {
    findOne: jest.fn().mockResolvedValue(JobDescriptionDto),
    find: jest.fn().mockResolvedValue([JobDescriptionDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockJobOpeningsMain = {
    findOne: jest.fn().mockResolvedValue(JobOpeningsMainDto),
    find: jest.fn().mockResolvedValue([JobOpeningsMainDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockPostJob = {
    findOne: jest.fn().mockResolvedValue(PostJobDto),
    find: jest.fn().mockResolvedValue([PostJobDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCandidatesComments = {
    findOne: jest.fn().mockResolvedValue(CandidatesCommentsDto),
    find: jest.fn().mockResolvedValue([CandidatesCommentsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCandidatesReplies = {
    findOne: jest.fn().mockResolvedValue(CandidatesRepliesDto),
    find: jest.fn().mockResolvedValue([CandidatesRepliesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCandidatesHistory = {
    findOne: jest.fn().mockResolvedValue(CandidatesHistoryDto),
    find: jest.fn().mockResolvedValue([CandidatesHistoryDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCandidatesHistoryActivity = {
    findOne: jest.fn().mockResolvedValue(CandidatesHistoryActivityDto),
    find: jest.fn().mockResolvedValue([CandidatesHistoryActivityDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockAdditionalQuestions = {
    findOne: jest.fn().mockResolvedValue(AdditionalQuestionsDto),
    find: jest.fn().mockResolvedValue([AdditionalQuestionsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAdditionalQuestionsChoices = {
    findOne: jest.fn().mockResolvedValue(AdditionalQuestionsChoicesDto),
    find: jest.fn().mockResolvedValue([AdditionalQuestionsChoicesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockApplicationQuestions = {
    findOne: jest.fn().mockResolvedValue(ApplicationQuestionsDto),
    find: jest.fn().mockResolvedValue([ApplicationQuestionsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockCreator = {
    findOne: jest.fn().mockResolvedValue(CreatorDto),
    find: jest.fn().mockResolvedValue([CreatorDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockJobApplication = {
    findOne: jest.fn().mockResolvedValue(JobApplicationDto),
    find: jest.fn().mockResolvedValue([JobApplicationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue(JobApplicationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobApplicationStatus = {
    findOne: jest.fn().mockResolvedValue(JobApplicationStatusDto),
    find: jest.fn().mockResolvedValue([JobApplicationStatusDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockViewList = {
    findOne: jest.fn().mockResolvedValue(ViewListDto),
    find: jest.fn().mockResolvedValue([ViewListDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCollobarators = {
    findOne: jest.fn().mockResolvedValue(CollobaratorsDto),
    find: jest.fn().mockResolvedValue([CollobaratorsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockCollobaratorsMain = {
    findOne: jest.fn().mockResolvedValue(CollobaratorsMainDto),
    find: jest.fn().mockResolvedValue([CollobaratorsMainDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mockEmployee = {
    findOne: jest.fn().mockResolvedValue(EmployeeDto),
    find: jest.fn().mockResolvedValue([EmployeeDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  };
  const mock = {}
  const mockAuthGuard = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(HrmEmployeeDetails))
    .useValue(mockEmployee)
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
    .overrideProvider(getRepositoryToken(HrmFolders))
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
    .overrideProvider(getRepositoryToken(hrmHiring))
    .useValue(mock)
    .overrideProvider(getRepositoryToken(hrmPayroll))
    .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/hiring/candidates (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/hiring/candidates')
      .send({})
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/hiring/candidates (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/hiring/candidates')
      .expect(200);
  });
  it(`/hiring/candidates/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/hiring/candidates/:id')
      .expect(200);
  });
  it(`/hiring/candidates/job-openings/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/hiring/candidates/job-openings/:id')
      .expect(200);
  });
  it(`/hiring/candidates/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/hiring/candidates/:id')
      .expect(200);
  });
  it(`/hiring/candidates (PUT)`, () => {
    return request(app.getHttpServer())
    .put('/hiring/candidates')
    .send({ candidatesList: []})
    .expect(200);
  });
  it(`/hiring/candidates/job-opening/move/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/hiring/candidates/job-opening/move/:id')
      .send({ candidatesList: []})
      .expect(200);
  });
  it(`/hiring/candidates/job-opening/move (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/hiring/candidates/job-opening/move')
      .send({ candidatesList: []})
      .expect(200);
  });
  it(`/hiring/candidates/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/hiring/candidates/:id')
      .expect(200);
  });
  it(`/hiring/candidates (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/hiring/candidates')
      .send({ candidatesList: []})
      .expect(200);
  });
});
