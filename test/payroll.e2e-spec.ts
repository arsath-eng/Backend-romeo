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
import { PayrollModule } from '../src/payroll/module/payroll.module';
import { BenefitsEmployee } from '../src/benefits/entities/benefitsEmployee.entity';
import { EmployeeStatus } from '../src/employeeStatus/entities/employeeStatus.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { OffboardingTaskEmployees } from '../src/offBoarding/entities/offboardingTaskEmployees.entity';
import { payrollEmployee } from '../src/payroll/entities/payrollEmployee.entity';
import { payrollPolicy } from '../src/payroll/entities/payrollPolicy.entity';
import { payrollTypes } from '../src/payroll/entities/payrollTypes.entity';
import { Training } from '../src/training/entities/Training.entity';
import { TrainingComplete } from '../src/trainingComplete/entities/trainingComplete.entity';
describe('PayrollController (e2e)', () => {
  let app: INestApplication;
  let newPerformanceTaskDto = {
    id: '',
    employeeId: '',
    task: '',
    description: '',
    empScore: '',
    supScore: '',
    status: '',
    creatorId: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
    score: '',
  };
  let trainingCompleteDto = {
    id: '',
    trainingId: '',
    note: '',
    attachFiles: [],
    employeeId: '',
    cost: '',
    completedDate: '',
    currency: '',
    credits: '',
    hours: '',
    instructor: '',
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let benefitsEmployeeDto = {
    id: '',
    form: {},
    employeeId: '',
    benefitsId: '',
    status: '',
    change: '',
    changeBy: '',
    activeStatus: '',
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
  let offboardingTaskEmployeesDto = {
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
    employeeId: 'doesntInclude',
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
  let payrollEmployeeDto = {
    id: '',
    employeeId: '',
    payrollPolicyId: '',
    earnings: {},
    contributions: {},
    deductions: {},
    tax: {},
    lastPay: '',
    initialDateCount: '',
    firstTime: false,
    configuredBy: '',
    policyStartDate: '',
    nextPay: '',
    grossPay: '',
    paidStatus: '',
    companyId: '',
    createdAt: '',
    modifiedAt: '',
    policyObj: {},
  };
  let payrollPolicyDto = {
    id: '',
    policyDetails: {},
    earningDetails: {},
    deductionDetails: {},
    contributionDetails: {},
    taxDetails: {},
    companyId: '',
    createdAt: '',
    modifiedAt: '',
    scheduleObj: {},
    schedule: false,
  };
  let payrollTypesDto = {
    id: '',
    name: '',
    field: '',
    selectType: '',
    category: '',
    permanent: false,
    companyId: '',
    createdAt: '',
    modifiedAt: '',
  };
  let trainingDto = {
    id: '',
    name: '',
    description: '',
    link: '',
    categoryId: '',
    hasCategory: false,
    frequency: '',
    repeat: '',
    every: 1,
    attachfiles: [],
    monthNo: [],
    required: false,
    requiredList: [],
    due: false,
    dueDate: 1,
    completedList: [],
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let employeeStatusDto = {
    id: '',
    employeeId: '',
    effectiveDate: '',
    status: '',
    comment: '',
    terminateReason: '',
    active: false,
    createdAt: '',
    modifiedAt: '',
    companyId: '',
  };
  let jobInformationDto = {
    id: '',
    employeeId: '',
    effectiveDate: '',
    jobTitle: '',
    location: '',
    department: '',
    division: '',
    active: false,
    reportTo: {
      id: '',
      employeeId: '',
      reporterId: '',
      reporterName: '',
      companyId: '',
    },
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
  const mockOnboardingTaskEmployees = {
    findOne: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    find: jest.fn().mockResolvedValue([onboardingTaskEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue(onboardingTaskEmployeesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockNewPerformanceTask = {
    findOne: jest.fn().mockResolvedValue(newPerformanceTaskDto),
    find: jest.fn().mockResolvedValue([newPerformanceTaskDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(newPerformanceTaskDto),
    findOneOrFail: jest.fn().mockResolvedValue(newPerformanceTaskDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTrainingComplete = {
    findOne: jest.fn().mockResolvedValue(trainingCompleteDto),
    find: jest.fn().mockResolvedValue([trainingCompleteDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(trainingCompleteDto),
    findOneOrFail: jest.fn().mockResolvedValue(trainingCompleteDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockBenefitsEmployee = {
    findOne: jest.fn().mockResolvedValue(benefitsEmployeeDto),
    find: jest.fn().mockResolvedValue([benefitsEmployeeDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(benefitsEmployeeDto),
    findOneOrFail: jest.fn().mockResolvedValue(benefitsEmployeeDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockOffboardingTaskEmployees = {
    findOne: jest.fn().mockResolvedValue(offboardingTaskEmployeesDto),
    find: jest.fn().mockResolvedValue([offboardingTaskEmployeesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(offboardingTaskEmployeesDto),
    findOneOrFail: jest.fn().mockResolvedValue(offboardingTaskEmployeesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockPayrollEmployee = {
    findOne: jest.fn().mockResolvedValue(payrollEmployeeDto),
    find: jest.fn().mockResolvedValue([payrollEmployeeDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(payrollEmployeeDto),
    findOneOrFail: jest.fn().mockResolvedValue(payrollEmployeeDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockPayrollPolicy = {
    findOne: jest.fn().mockResolvedValue(payrollPolicyDto),
    find: jest.fn().mockResolvedValue([payrollPolicyDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(payrollPolicyDto),
    findOneOrFail: jest.fn().mockResolvedValue(payrollPolicyDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockPayrollTypes = {
    findOne: jest.fn().mockResolvedValue(payrollTypesDto),
    find: jest.fn().mockResolvedValue([payrollTypesDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(payrollTypesDto),
    findOneOrFail: jest.fn().mockResolvedValue(payrollTypesDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeStatus = {
    findOne: jest.fn().mockResolvedValue(employeeStatusDto),
    find: jest.fn().mockResolvedValue([employeeStatusDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(employeeStatusDto),
    findOneOrFail: jest.fn().mockResolvedValue(employeeStatusDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformation = {
    findOne: jest.fn().mockResolvedValue(jobInformationDto),
    find: jest.fn().mockResolvedValue([jobInformationDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(jobInformationDto),
    findOneOrFail: jest.fn().mockResolvedValue(jobInformationDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTraining = {
    findOne: jest.fn().mockResolvedValue(trainingDto),
    find: jest.fn().mockResolvedValue([trainingDto]),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(trainingDto),
    findOneOrFail: jest.fn().mockResolvedValue(trainingDto),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockAuthGuard = {};
  const mock = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PayrollModule],
    })
      .overrideProvider(getRepositoryToken(newPerformanceTask))
      .useValue(mockNewPerformanceTask)
      .overrideProvider(getRepositoryToken(TrainingComplete))
      .useValue(mockTrainingComplete)
      .overrideProvider(getRepositoryToken(BenefitsEmployee))
      .useValue(mockBenefitsEmployee)
      .overrideProvider(getRepositoryToken(OnboardingTaskEmployees))
      .useValue(mockOnboardingTaskEmployees)
      .overrideProvider(getRepositoryToken(OffboardingTaskEmployees))
      .useValue(mockOffboardingTaskEmployees)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(payrollEmployee))
      .useValue(mockPayrollEmployee)
      .overrideProvider(getRepositoryToken(payrollPolicy))
      .useValue(mockPayrollPolicy)
      .overrideProvider(getRepositoryToken(payrollTypes))
      .useValue(mockPayrollTypes)
      .overrideProvider(getRepositoryToken(Training))
      .useValue(mockTraining)
      .overrideProvider(getRepositoryToken(EmployeeStatus))
      .useValue(mockEmployeeStatus)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformation)

      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mock)
      .overrideProvider(getRepositoryToken(Notifications))
      .useValue(mock)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/has-assigned/:employeeId (GET)`, () => {
    return request(app.getHttpServer())
      .get('/has-assigned/:employeeId')
      .expect(200)
      .expect({
        salaryDetails: true,
        training: true,
        performance: true,
      });
  });
  it(`/:companyId/settings/payroll/configurations-compensation-types (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/settings/payroll/configurations-compensation-types')
      .expect(200)
      .expect([payrollTypesDto]);
  });
  it(`/:companyId/settings/payroll/configurations-compensation-types (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/settings/payroll/configurations-compensation-types')
      .send(payrollTypesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/settings/payroll/configurations-compensation-types/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/:companyId/settings/payroll/configurations-compensation-types/:id')
      .send(onboardingTaskEmployeesDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/settings/payroll/configurations-compensation-types/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete(
        '/:companyId/settings/payroll/configurations-compensation-types/:id',
      )
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/settings/payroll/configurations-payroll-policy (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/settings/payroll/configurations-payroll-policy')
      .expect(200)
      .expect([payrollPolicyDto]);
  });
  it(`/:companyId/settings/payroll/configurations-payroll-policy (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/settings/payroll/configurations-payroll-policy')
      .send(payrollPolicyDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/settings/payroll/configurations-payroll-policy/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/:companyId/settings/payroll/configurations-payroll-policy/:id')
      .send(payrollPolicyDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/settings/payroll/configurations-payroll-policy/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/:companyId/settings/payroll/configurations-payroll-policy/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/payroll/employees/paid (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/payroll/employees/paid')
      .expect(200)
      .expect([
        {
          id: '',
          employeeId: '',
          payrollPolicyId: '',
          earnings: {},
          contributions: {},
          deductions: {},
          tax: {},
          lastPay: '',
          initialDateCount: '',
          firstTime: false,
          configuredBy: '',
          policyStartDate: '',
          nextPay: '',
          grossPay: '',
          paidStatus: '',
          companyId: '',
          createdAt: '',
          modifiedAt: '',
          policyObj: {},
          earningYTD: 0,
        },
      ]);
  });
  it(`/:companyId/payroll/employees/unpaid (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/payroll/employees/unpaid')
      .expect(200)
      .expect([
        {
          id: '',
          employeeId: '',
          payrollPolicyId: '',
          earnings: {},
          contributions: {},
          deductions: {},
          tax: {},
          lastPay: '',
          initialDateCount: '',
          firstTime: false,
          configuredBy: '',
          policyStartDate: '',
          nextPay: '',
          grossPay: '',
          paidStatus: '',
          companyId: '',
          createdAt: '',
          modifiedAt: '',
          policyObj: {},
          earningYTD: 0,
        },
      ]);
  });
  it(`/:companyId/payroll/employees/not-assigned (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/payroll/employees/not-assigned')
      .expect(200)
      .expect(['doesntInclude']);
  });
  it(`/payroll/:employeeId/paid (GET)`, () => {
    return request(app.getHttpServer())
      .get('/payroll/:employeeId/paid')
      .expect(200)
      .expect([
        {
          id: '',
          employeeId: '',
          payrollPolicyId: '',
          earnings: {},
          contributions: {},
          deductions: {},
          tax: {},
          lastPay: '',
          initialDateCount: '',
          firstTime: false,
          configuredBy: '',
          policyStartDate: '',
          nextPay: '',
          grossPay: '',
          paidStatus: '',
          companyId: '',
          createdAt: '',
          modifiedAt: '',
          policyObj: {},
          earningYTD: 0,
        },
      ]);
  });
  it(`/:companyId/payroll/employees (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/payroll/employees')
      .send(payrollEmployeeDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/payroll/employees/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/:companyId/payroll/employees/:id')
      .send(payrollEmployeeDto)
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
  it(`/:companyId/payroll/employees/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/:companyId/payroll/employees/:id')
      .expect(200)
      .expect({ statusCode: 200, description: 'success' });
  });
});
