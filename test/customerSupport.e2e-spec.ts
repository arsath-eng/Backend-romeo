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
const globalPrefix = 'app/v1';

describe('CustomerSupportController (e2e)', () => {
  let app: INestApplication;
  let customerSupportDto = {
    msgId: "",
    msg:{},
    subject: "",
    senderId: "",
    companyId: "",
    createdAt: '',
    modifiedAt: '',
  }
  let getCustomerSupportDto = {
    msgId: "",
    msg:{},
    subject: "",
    senderId: "",
    companyId: "",
    createdAt: '',
    modifiedAt: '',
    senderName:" ",
    senderProfile:""
  }
  let employeeDto = { 
    fullName: {
      first:"",
      last:""
    },
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
  const mockCustomerSupport = {
    findOne:jest.fn().mockResolvedValue(customerSupportDto),
    find:jest.fn().mockResolvedValue([customerSupportDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CustomerSupportModule],
    })
      .overrideProvider(getRepositoryToken(customerSupport)).useValue(mockCustomerSupport)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/customer-support (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/customer-support')
      .expect(200)
      .expect([getCustomerSupportDto])
  });
  it(`/connect-main/:companyId/customer-support (GET)`, () => {
    return request(app.getHttpServer())
      .get('/connect-main/:companyId/customer-support')
      .expect(200)
      .expect([getCustomerSupportDto])
  });
  it(`/:companyId/customer-support (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/customer-support')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/sap/:companyId/customer-support (GET)`, () => {
    return request(app.getHttpServer())
      .get('/sap/:companyId/customer-support')
      .expect(200)
      .expect([customerSupportDto])
  });
  it(`/sap/customer-support (POST)`, () => {
    return request(app.getHttpServer())
      .post('/sap/customer-support')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
