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
import { JobInformationModule } from '../src/jobInformation/module/jobInformation.module';
import { Compensation } from '../src/compensation/entities/compensation.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { HolidayAlert } from '../src/notifications/entities/holidayAlert.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { TimeOffRequestNotificationDates } from '../src/notifications/entities/timeOffRequestNotificationDates.entity';
import { AccessLevels } from '../src/settingsAccessLevels/entities/settingsAccessLevels.entity';
import { AccessLevelsEmployees } from '../src/settingsAccessLevelsEmployees/entities/accessLevelsEmployees.entity';
import { ApprovalsAll } from '../src/settingsApprovals/entities/approvalsAll.entity';
import { ApprovalsEmployees } from '../src/settingsApprovalsEmployees/entities/approvalsEmployees.entity';
import { PaySchedules } from '../src/settingsEmployeeFeildsPaySchedules/entities/paySchedules.entity';
import { Holiday } from '../src/settingsHoliday/entities/Holiday.entity';
import { activityTracking } from '../src/time-tracking/entities/activityTracking.entity';
import { timeTracking } from '../src/time-tracking/entities/timeTracking.entity';
import { timeTrackingApproval } from '../src/time-tracking/entities/timeTrackingApproval.entity';
import { timeTrackingEmployee } from '../src/time-tracking/entities/timeTrackingEmployee.entity';
import { timeTrackingEmployeeData } from '../src/time-tracking/entities/timeTrackingEmployeeData.entity';
import { timeTrackingNotificationData } from '../src/time-tracking/entities/timeTrackingNotificationData.entity';
import { timeTrackingProjects } from '../src/time-tracking/entities/timeTrackingProjects.entity';
import { TimezoneService } from '../src/timezone/timezone.service';
import { JobOpeningModule } from '../src/jobOpenings/module/jobOpening.module';
import { AdditionalQuestions } from '../src/jobOpenings/entities/additionalQuestions.entity';
import { AdditionalQuestionsChoices } from '../src/jobOpenings/entities/additionalQuestionsChoices.entity';
import { ApplicationQuestions } from '../src/jobOpenings/entities/applicationQuestions.entity';
import { Collobarators } from '../src/jobOpenings/entities/collobarators.entity';
import { CollobaratorsMain } from '../src/jobOpenings/entities/collobaratorsMain.entity';
import { Creator } from '../src/jobOpenings/entities/creator.entity';
import { JobApplication } from '../src/jobOpenings/entities/jobApplication.entity';
import { JobApplicationStatus } from '../src/jobOpenings/entities/jobApplicationStatus.entity';
import { JobDescription } from '../src/jobOpenings/entities/jobDescription.entity';
import { JobOpeningsMain } from '../src/jobOpenings/entities/jobOpeningMain.entity';
import { PostJob } from '../src/jobOpenings/entities/postJob.entity';
import { ViewList } from '../src/jobOpenings/entities/viewList.entity';
import { TalentPoolsCandidates } from '../src/talentPools/entities/talentPoolsCandidates.entity';
import { TalentPoolsCollaborators } from '../src/talentPools/entities/talentPoolsCollabarators.entity';
import { APIService } from '../src/superAdminPortalAPI/APIservice.service';
describe('JobOpeningsController (e2e)', () => {
  let app: INestApplication;
  let companyDto = {
    id: '',
    companyName: '',
    stripeCustomerId: '',
    initialEmail: '',
    paymentLink: '',
    noEmp: '',
    country: '',
    heroLogoURL: '',
    logoURL: '',
    paidStatus: '',
    status: '',
    features: [],
    addonFeatures: [],
    theme: '',
    trialActive: true,
    demoData: true,
    createdAt: '',
    modifiedAt: '',
    waitingPeriod: true,
    timezone: 'Asia/Colombo',
    waitingPeriodStartDate: '',
    addonStatus: true,
    employeeAddStatus: true,
    currency: '',
  };

  let reportToDto = {
    id: '',
    employeeId: '',
    reporterId: '',
    reporterName: '',
    companyId: '',
  };
  let additionalQuestionsDto = {
    id: '',
    jobApplicationId: '',
    question: '',
    type: '',
    required: true,
    otherChoice: true,
    value: '',
  };
  let additionalQuestionsChoicesDto = {
    pid: '',
    additionalQuestionId: '',
    id: '',
    text: '',
    checked: true,
  };
  let applicationQuestionsDto = {
    id: '',
    jobApplicationId: '',
    required: true,
    type: '',
    checked: true,
    value: '',
    name: 'test',
  };
  let creatorDto = {
    id: '',
    creatorId: '',
    creatorName: '',
  };
  let jobApplicationStatusDto = {
    id: '',
    name: '',
    comment: '',
  };
  let jobApplicationDto = {
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
    country: '',
    other: true,
    applicant: true,
    gender: '',
    ethnicity: '',
    disability: '',
    veterianStatus: '',
    rating: '',
    offer: true,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    status: jobApplicationStatusDto,
  };
  let jobDescriptionDto = {
    id: '',
    delta: {},
    text: '',
    justHtml: '',
  };
  let postJobDto = {
    id: '',
    indeed: true,
    ziprecruiter: true,
  };
  let jobOpeningsMainDto = {
    id: '',
    postingTitle: '',
    jobStatus: '',
    hiringLead: '',
    department: '',
    employmentType: '',
    minimumExperience: '',
    location: '',
    country: '',
    city: '',
    province: '',
    postalCode: '',
    compensation: '',
    internalJobCode: '',
    jobCategory: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    creator: creatorDto,
    postJob: postJobDto,
    jobDescription: jobDescriptionDto,
    jobApplication: jobApplicationDto,
  };
  let viewListDto = {
    jobOpeningId: '',
    viewList: [],
  };
  let collobaratorsDto = {
    id: '',
    jobOpeningId: '',
    collaboratorId: '',
    collaboratorName: '',
    role: '',
    type: '',
    email: '',
  };
  let collobaratorsMainDto = {
    jobOpeningId: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let jobInformationDto = {
    id: '',
    employeeId: '',
    effectiveDate: '2022-12-12',
    jobTitle: '',
    location: '',
    department: '',
    division: '',
    active: '',
    reportTo: reportToDto,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let talentPoolsCollaboratorsDto = {
    id: '',
    talentPoolId: '',
    collaboratorId: '',
    collaboratorName: '',
    role: '',
    type: '',
    email: true,
    companyId: '',
  };
  let talentPoolsCandidatesDto = {
    id: '',
    candidateId: '',
    talentPoolId: '',
    comment: '',
    addedBy: '',
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
  const mockAdditionalQuestions = {
    findOne: jest.fn().mockResolvedValue(additionalQuestionsDto),
    find: jest.fn().mockResolvedValue([additionalQuestionsDto]),
    create: jest.fn().mockResolvedValue(additionalQuestionsDto),
    save: jest.fn().mockResolvedValue(additionalQuestionsDto),
    findOneOrFail: jest.fn().mockResolvedValue(additionalQuestionsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAdditionalQuestionsChoices = {
    findOne: jest.fn().mockResolvedValue(additionalQuestionsChoicesDto),
    find: jest.fn().mockResolvedValue([additionalQuestionsChoicesDto]),
    create: jest.fn().mockResolvedValue(additionalQuestionsChoicesDto),
    save: jest.fn().mockResolvedValue(additionalQuestionsChoicesDto),
    findOneOrFail: jest.fn().mockResolvedValue(additionalQuestionsChoicesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockApplicationQuestions = {
    findOne: jest.fn().mockResolvedValue(applicationQuestionsDto),
    find: jest.fn().mockResolvedValue([applicationQuestionsDto]),
    create: jest.fn().mockResolvedValue(applicationQuestionsDto),
    save: jest.fn().mockResolvedValue(applicationQuestionsDto),
    findOneOrFail: jest.fn().mockResolvedValue(applicationQuestionsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockCreator = {
    findOne: jest.fn().mockResolvedValue(creatorDto),
    find: jest.fn().mockResolvedValue([creatorDto]),
    create: jest.fn().mockResolvedValue(creatorDto),
    save: jest.fn().mockResolvedValue(creatorDto),
    findOneOrFail: jest.fn().mockResolvedValue(creatorDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobApplication = {
    findOne: jest.fn().mockResolvedValue(jobApplicationDto),
    find: jest.fn().mockResolvedValue([jobApplicationDto]),
    create: jest.fn().mockResolvedValue(jobApplicationDto),
    save: jest.fn().mockResolvedValue(jobApplicationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobApplicationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobApplicationStatus = {
    findOne: jest.fn().mockResolvedValue(jobApplicationStatusDto),
    find: jest.fn().mockResolvedValue([jobApplicationStatusDto]),
    create: jest.fn().mockResolvedValue(jobApplicationStatusDto),
    save: jest.fn().mockResolvedValue(jobApplicationStatusDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobApplicationStatusDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobDescription = {
    findOne: jest.fn().mockResolvedValue(jobDescriptionDto),
    find: jest.fn().mockResolvedValue([jobDescriptionDto]),
    create: jest.fn().mockResolvedValue(jobDescriptionDto),
    save: jest.fn().mockResolvedValue(jobDescriptionDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobDescriptionDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobOpeningsMain = {
    findOne: jest.fn().mockResolvedValue(jobOpeningsMainDto),
    find: jest.fn().mockResolvedValue([jobOpeningsMainDto]),
    create: jest.fn().mockResolvedValue(jobOpeningsMainDto),
    save: jest.fn().mockResolvedValue(jobOpeningsMainDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobOpeningsMainDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockPostJob = {
    findOne: jest.fn().mockResolvedValue(postJobDto),
    find: jest.fn().mockResolvedValue([postJobDto]),
    create: jest.fn().mockResolvedValue(postJobDto),
    save: jest.fn().mockResolvedValue(postJobDto),
    findOneOrFail: jest.fn().mockResolvedValue(postJobDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockViewList = {
    findOne: jest.fn().mockResolvedValue(viewListDto),
    find: jest.fn().mockResolvedValue([viewListDto]),
    create: jest.fn().mockResolvedValue(viewListDto),
    save: jest.fn().mockResolvedValue(viewListDto),
    findOneOrFail: jest.fn().mockResolvedValue(viewListDto),
    remove: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };
  const mockCollobarators = {
    findOne: jest.fn().mockResolvedValue(collobaratorsDto),
    find: jest.fn().mockResolvedValue([collobaratorsDto]),
    create: jest.fn().mockResolvedValue(collobaratorsDto),
    save: jest.fn().mockResolvedValue(collobaratorsDto),
    findOneOrFail: jest.fn().mockResolvedValue(collobaratorsDto),
    remove: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };
  const mockCollobaratorsMain = {
    findOne: jest.fn().mockResolvedValue(collobaratorsMainDto),
    find: jest.fn().mockResolvedValue([collobaratorsMainDto]),
    create: jest.fn().mockResolvedValue(collobaratorsMainDto),
    save: jest.fn().mockResolvedValue(collobaratorsMainDto),
    findOneOrFail: jest.fn().mockResolvedValue(collobaratorsMainDto),
    remove: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformation = {
    findOne: jest.fn().mockResolvedValue(jobInformationDto),
    find: jest.fn().mockResolvedValue([jobInformationDto]),
    create: jest.fn().mockResolvedValue(jobInformationDto),
    save: jest.fn().mockResolvedValue(jobInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobInformationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTalentPoolsCollaborators = {
    findOne: jest.fn().mockResolvedValue(talentPoolsCollaboratorsDto),
    find: jest.fn().mockResolvedValue([talentPoolsCollaboratorsDto]),
    create: jest.fn().mockResolvedValue(talentPoolsCollaboratorsDto),
    save: jest.fn().mockResolvedValue(talentPoolsCollaboratorsDto),
    findOneOrFail: jest.fn().mockResolvedValue(talentPoolsCollaboratorsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTalentPoolsCandidates = {
    findOne: jest.fn().mockResolvedValue(talentPoolsCandidatesDto),
    find: jest.fn().mockResolvedValue([talentPoolsCandidatesDto]),
    create: jest.fn().mockResolvedValue(talentPoolsCandidatesDto),
    save: jest.fn().mockResolvedValue(talentPoolsCandidatesDto),
    findOneOrFail: jest.fn().mockResolvedValue(talentPoolsCandidatesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAuthGuard = {};
  const mockAPIService = {
    getCompanyById: jest.fn().mockResolvedValue(companyDto),
  };
  const mock = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JobOpeningModule],
    })

      .overrideProvider(getRepositoryToken(AdditionalQuestions))
      .useValue(mockAdditionalQuestions)
      .overrideProvider(getRepositoryToken(AdditionalQuestionsChoices))
      .useValue(mockAdditionalQuestionsChoices)
      .overrideProvider(getRepositoryToken(ApplicationQuestions))
      .useValue(mockApplicationQuestions)
      .overrideProvider(getRepositoryToken(Creator))
      .useValue(mockCreator)
      .overrideProvider(getRepositoryToken(JobApplication))
      .useValue(mockJobApplication)
      .overrideProvider(getRepositoryToken(JobApplicationStatus))
      .useValue(mockJobApplicationStatus)
      .overrideProvider(getRepositoryToken(JobDescription))
      .useValue(mockJobDescription)
      .overrideProvider(getRepositoryToken(JobOpeningsMain))
      .useValue(mockJobOpeningsMain)
      .overrideProvider(getRepositoryToken(PostJob))
      .useValue(mockPostJob)
      .overrideProvider(getRepositoryToken(ViewList))
      .useValue(mockViewList)
      .overrideProvider(getRepositoryToken(Collobarators))
      .useValue(mockCollobarators)
      .overrideProvider(getRepositoryToken(CollobaratorsMain))
      .useValue(mockCollobaratorsMain)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformation)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaborators))
      .useValue(mockTalentPoolsCollaborators)
      .overrideProvider(getRepositoryToken(TalentPoolsCandidates))
      .useValue(mockTalentPoolsCandidates)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockAuthGuard)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(APIService)
      .useValue(mockAPIService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/hiring/job-openings (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/hiring/job-openings')
      .send(jobOpeningsMainDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/hiring/job-openings (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/hiring/job-openings')
      .expect(200)
      .expect([jobOpeningsMainDto]);
  });
  it(`/get-available-jobs/:companyId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/get-available-jobs/:companyId')
      .expect(200)
      .expect({
        jobs: [
          {
            id: '',
            postingTitle: '',
            jobStatus: '',
            hiringLead: '',
            department: '',
            employmentType: '',
            minimumExperience: '',
            location: '',
            country: '',
            city: '',
            province: '',
            postalCode: '',
            compensation: '',
            internalJobCode: '',
            jobCategory: '',
            createdAt: '',
            modifiedAt: '',
            companyId: '',
            creator: creatorDto,
            postJob: postJobDto,
            jobDescription: jobDescriptionDto,
            jobApplication: jobApplicationDto,
            candidatesCount: '1',
          },
        ],
        companyData: {
          companyId: ':companyId',
          companyName: '',
          companyLogo: '',
        },
      });
  });
  it(`/hiring/job-openings/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/hiring/job-openings/:id')
      .expect(200)
      .expect({
        id: '',
        postingTitle: '',
        jobStatus: '',
        hiringLead: '',
        department: '',
        employmentType: '',
        minimumExperience: '',
        location: '',
        country: '',
        city: '',
        province: '',
        postalCode: '',
        compensation: '',
        internalJobCode: '',
        jobCategory: '',
        createdAt: '',
        modifiedAt: '',
        companyId: '',
        creator: { id: '', creatorId: '', creatorName: '' },
        postJob: { id: '', indeed: true, ziprecruiter: true },
        jobDescription: { id: '', delta: {}, text: '', justHtml: '' },
        jobApplication: {
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
          country: '',
          other: true,
          applicant: true,
          gender: '',
          ethnicity: '',
          disability: '',
          veterianStatus: '',
          rating: '',
          offer: true,
          createdAt: '',
          modifiedAt: '',
          companyId: '',
          status: { id: '', name: '', comment: '' },
          applicationQuestions: { test: applicationQuestionsDto },
          additionalQuestions: [additionalQuestionsDto],
        },
        candidatesCount: '1',
      });
  });
  it(`/hiring/job-openings/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/hiring/job-openings/:id')
      .send({
        id: '',
        postingTitle: '',
        jobStatus: '',
        hiringLead: '',
        department: '',
        employmentType: '',
        minimumExperience: '',
        location: '',
        country: '',
        city: '',
        province: '',
        postalCode: '',
        compensation: '',
        internalJobCode: '',
        jobCategory: '',
        createdAt: '',
        modifiedAt: '',
        companyId: '',
        creator: creatorDto,
        postJob: postJobDto,
        jobDescription: jobDescriptionDto,
        jobApplication: {
          applicationQuestions: [applicationQuestionsDto],
          additionalQuestions: [additionalQuestionsDto],
        },
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/hiring/job-openings/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/hiring/job-openings/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/hiring/collaborators/job-openings (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/hiring/collaborators/job-openings')
      .send({ collaborators: [collobaratorsDto] })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/hiring/collaborators/job-openings (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/hiring/collaborators/job-openings')
      .expect(200)
      .expect([
        {
          jobOpeningId: '',
          createdAt: '',
          modifiedAt: '',
          companyId: '',
          viewList: { jobOpeningId: '', viewList: [] },
          collaborators: [collobaratorsDto],
        },
      ]);
  });
  it(`/hiring/collaborators/job-openings/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/hiring/collaborators/job-openings/:id')
      .expect(200)
      .expect({
        jobOpeningId: '',
        createdAt: '',
        modifiedAt: '',
        companyId: '',
        viewList: { jobOpeningId: '', viewList: [] },
        collaborators: [
          {
            id: '',
            jobOpeningId: '',
            collaboratorId: '',
            collaboratorName: '',
            role: '',
            type: '',
            email: '',
          },
        ],
      });
  });
  it(`/access-levels/hiring/employee/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/access-levels/hiring/employee/:id')
      .expect(200)
      .expect({
        employeeId: ':id',
        showJobOpening: true,
        jobOpeningIdList: [''],
        hiringAccess: true,
        accessJobOpeningIdList: [''],
        showTalentPool: true,
        talentPoolIdList: [''],
      });
  });
  it(`/hiring/collaborators/job-openings/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/hiring/collaborators/job-openings/:id')
      .send(collobaratorsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
