import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { AdjustTimeOffBalanceModule } from '../src/adjustTimeOffBalance/module/adjustTimeOffBalance.module';
import { TimezoneService } from '../src/timezone/timezone.service';
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';
import { Notifications } from '@flows/allDtos/notifications.dto';
import { commonDto } from '@flows/allDtos/common.dto';
import { folders } from '@flows/allDtos/folders.dto';
import { HrmFiles } from '@flows/allEntities/hrmFiles.entity';
const globalPrefix = 'app/v1';

describe('AdjustTimeoffBalanceController (e2e)', () => {
  let app: INestApplication;
  let adjustTimeOffBalanceDto = {}
  let TimeOffRequestNotificationDataDto = {}
  let TimeOffInformationDto = {}
  let AddNoPayDto = {}
  let RemoveNoPayDto = {}
  let NotificationsDto = {}
  let DocumentsDto = {}
  let FoldersDto = {}
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


  const mockAdjustTimeOffBalance = {
    findOne:jest.fn().mockResolvedValue(adjustTimeOffBalanceDto),
    findOneOrFail:jest.fn().mockResolvedValue(adjustTimeOffBalanceDto),
    find:jest.fn().mockResolvedValue([adjustTimeOffBalanceDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockTimeOffRequestNotificationData = {
    findOne:jest.fn().mockResolvedValue(TimeOffRequestNotificationDataDto),
    find:jest.fn().mockResolvedValue([TimeOffRequestNotificationDataDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockTimeOffInformation = {
    findOne:jest.fn().mockResolvedValue(TimeOffInformationDto),
    find:jest.fn().mockResolvedValue([TimeOffInformationDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockAddNoPay = {
    findOne:jest.fn().mockResolvedValue(AddNoPayDto),
    find:jest.fn().mockResolvedValue([AddNoPayDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockRemoveNoPay = {
    findOne:jest.fn().mockResolvedValue(RemoveNoPayDto),
    find:jest.fn().mockResolvedValue([RemoveNoPayDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockNotifications = {
    findOne:jest.fn().mockResolvedValue(NotificationsDto),
    find:jest.fn().mockResolvedValue([NotificationsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockDocuments = {
    findOne:jest.fn().mockResolvedValue(DocumentsDto),
    find:jest.fn().mockResolvedValue([DocumentsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockFolders = {
    findOne:jest.fn().mockResolvedValue(FoldersDto),
    find:jest.fn().mockResolvedValue([FoldersDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockTimezoneService = {
    dateMatches:jest.fn().mockResolvedValue(false),
  }
  const mockAuthGuard = {}
  const mockAccuralLevels = {}
  const mockTimeOffPolicies = {}
  const mockTimeOffCategory = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdjustTimeOffBalanceModule],
    }).overrideProvider(getRepositoryToken(employeeDetails)).useValue(mockAdjustTimeOffBalance)
      .overrideProvider(getRepositoryToken(employeeDetails)).useValue(mockTimeOffInformation)
      //.overrideProvider(getRepositoryToken(TimeOffRequestNotificationData)).useValue(mockTimeOffRequestNotificationData)
      .overrideProvider(getRepositoryToken(Notifications)).useValue(mockNotifications)
      //.overrideProvider(getRepositoryToken(RemoveNoPay)).useValue(mockRemoveNoPay)
      //.overrideProvider(getRepositoryToken(AddNoPay)).useValue(mockAddNoPay)
      .overrideProvider(getRepositoryToken(HrmFiles)).useValue(mockDocuments)
      .overrideProvider(getRepositoryToken(folders)).useValue(mockFolders)
      .overrideProvider(getRepositoryToken(employeeDetails)).useValue(mockEmployee)
      .overrideProvider(getRepositoryToken(employeeDetails)).useValue(mockAccuralLevels)
      .overrideProvider(getRepositoryToken(commonDto)).useValue(mockTimeOffPolicies)
      .overrideProvider(getRepositoryToken(commonDto)).useValue(mockTimeOffCategory)
      .overrideProvider(TimezoneService).useValue(mockTimezoneService)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/adjust-balances/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/adjust-balances')
      .expect(200)
  });
  it(`/:companyId/adjust-balances (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/adjust-balances')
      .expect(200)
  });
  it(`/adjust-balances/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/adjust-balances/:id')
      .expect(200)
  });
  it(`/adjust-balances/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/adjust-balances/:id')
      .expect(200)
  });
});
