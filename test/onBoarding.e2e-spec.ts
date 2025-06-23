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
import { OnboardingTaskModule } from '../src/settingsOnboardingTask/module/module';
import { OnBoarding } from '../src/notifications/entities/onBoarding.entity';
import { OnboardingTaskEmployees } from '../src/onBoarding/entities/onboardingTaskEmployees.entity';
import { OnboardingTask } from '../src/settingsOnboardingTask/entities/onboardingTask.entity';
import { OnboardingTaskEmployeesModule } from '../src/onBoarding/module/module';
import { OnboardingTaskEmployeesComments } from '../src/onBoarding/entities/onboardingTaskEmployeesComments.entity';
describe('OnBoardingController (e2e)', () => {
  let app: INestApplication;
  let onboardingTaskEmployeesCommentsDto = {
    id: '',
    assignId: '',
    comment: '',
    commentorId: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let onboardingTaskEmployeesDto = {
    id: '',
    employeeId: '',
    preDefined: false,
    taskId: '',
    form: {},
    completed: false,
    completedBy: '',
    completedDate: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let onBoardingDto = {
    id: '',
    onBoardingTaskEmployeeId: '',
    createdAt: '',
    modifiedAt: '',
  };
  let onBoardingTaskDto = {
    id: '',
    name: '',
    categoryId: '',
    description: '',
    assignTo: '',
    dueDate: {},
    sendNotification: '',
    attachFiles: [],
    allEmployees: '',
    eligible: [],
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let notificationsDto = {
    id: '',
    type: 'assetRequest',
    data: {
      requesterName: '',
      employeeName: '',
      employeeId: 'userId2',
    },
    hidden: false,
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
  const mockOnboardingTaskEmployees = {
    findOne: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    find: jest.fn().mockResolvedValue([onboardingTaskEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOnboardingTask = {
    findOne: jest.fn().mockResolvedValue(onBoardingTaskDto),
    find: jest.fn().mockResolvedValue([onBoardingTaskDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(onBoardingTaskDto),
    findOneOrFail: jest.fn().mockResolvedValue(onBoardingTaskDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOnboarding = {
    findOne: jest.fn().mockResolvedValue(onBoardingDto),
    find: jest.fn().mockResolvedValue([onBoardingDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(onBoardingDto),
    findOneOrFail: jest.fn().mockResolvedValue(onBoardingDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockNotifications = {
    findOne: jest.fn().mockResolvedValue(notificationsDto),
    find: jest.fn().mockResolvedValue([notificationsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(notificationsDto),
    findOneOrFail: jest.fn().mockResolvedValue(notificationsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOnboardingTaskEmployeesComments = {
    findOne: jest.fn().mockResolvedValue(onboardingTaskEmployeesCommentsDto),
    find: jest.fn().mockResolvedValue([onboardingTaskEmployeesCommentsDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(onboardingTaskEmployeesCommentsDto),
    findOneOrFail: jest
      .fn()
      .mockResolvedValue(onboardingTaskEmployeesCommentsDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAuthGuard = {};
  const mock = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OnboardingTaskEmployeesModule],
    })
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployees))
      .useValue(mockOnboardingTaskEmployees)
      .overrideProvider(getRepositoryToken(OnBoarding))
      .useValue(mockOnboarding)
      .overrideProvider(getRepositoryToken(OnboardingTask))
      .useValue(mockOnboardingTask)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mockNotifications)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployeesComments))
      .useValue(mockOnboardingTaskEmployeesComments)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/onboarding/task/employees (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/onboarding/task/employees')
      .send(onboardingTaskEmployeesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/onboarding/task/employees (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/onboarding/task/employees')
      .expect(200)
      .expect([onboardingTaskEmployeesDto]);
  });
  it(`/onboarding/task/employees/:employeeId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/onboarding/task/employees/:employeeId')
      .expect(200)
      .expect([onboardingTaskEmployeesDto]);
  });
  it(`/onboarding/task/employees/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/onboarding/task/employees/:id')
      .send(onboardingTaskEmployeesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/onboarding/task/employees/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/onboarding/task/employees/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/onboarding/task/employees/removeall (POST)`, () => {
    return request(app.getHttpServer())
      .post('/onboarding/task/employees/removeall')
      .send({
        employeeId: '',
        completed: '',
      })
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/companyId/onboarding/task/employees/comments (POST)`, () => {
    return request(app.getHttpServer())
      .post('/companyId/onboarding/task/employees/comments')
      .send(onboardingTaskEmployeesCommentsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/companyId/onboarding/task/employees/comments (GET)`, () => {
    return request(app.getHttpServer())
      .get('/companyId/onboarding/task/employees/comments')
      .expect(200)
      .expect([onboardingTaskEmployeesCommentsDto]);
  });
  it(`/onboarding/task/employees/comments/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/onboarding/task/employees/comments/:id')
      .expect(200)
      .expect([onboardingTaskEmployeesCommentsDto]);
  });
  it(`/onboarding/task/employees/comments/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/onboarding/task/employees/comments/:id')
      .send(onboardingTaskEmployeesCommentsDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/onboarding/task/employees/comments/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/onboarding/task/employees/comments/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
